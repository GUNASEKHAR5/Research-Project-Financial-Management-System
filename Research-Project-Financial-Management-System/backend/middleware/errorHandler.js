const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message);

  // PostgreSQL unique violation
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry. Record already exists.",
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Related record not found.",
    });
  }

  // PostgreSQL not-null violation
  if (err.code === "23502") {
    return res.status(400).json({
      success: false,
      message: `Required field missing: ${err.column}`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
