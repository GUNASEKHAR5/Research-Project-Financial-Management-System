require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const errorHandler = require("./middleware/errorHandler");

const authRoutes     = require("./routes/auth");
const userRoutes     = require("./routes/users");
const projectRoutes  = require("./routes/projects");
const budgetRoutes   = require("./routes/budgets");
const expenseRoutes  = require("./routes/expenses");
const paymentRoutes  = require("./routes/payments");
const agencyRoutes   = require("./routes/agencies");
const reportRoutes   = require("./routes/reports");
const auditRoutes    = require("./routes/audit");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/budgets",  budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/reports",  reportRoutes);
app.use("/api/audit",    auditRoutes);

// ── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ───────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
