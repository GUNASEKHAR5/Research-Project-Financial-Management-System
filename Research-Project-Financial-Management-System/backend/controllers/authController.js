const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const pool   = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── Helper: generate JWT ───────────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ── POST /api/auth/login ───────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);

    await logAudit({
      userId:     user.id,
      action:     "login",
      entityType: "user",
      entityId:   user.id,
      metadata:   { email: user.email },
    });

    res.json({
      success: true,
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/register ────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const allowedRoles = ["admin", "faculty", "finance"];
    const userRole = allowedRoles.includes(role) ? role : "faculty";

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, userRole]
    );

    const newUser = result.rows[0];
    const token   = generateToken(newUser);

    await logAudit({
      userId:     newUser.id,
      action:     "registered",
      entityType: "user",
      entityId:   newUser.id,
      metadata:   { email: newUser.email, role: newUser.role },
    });

    res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/change-password ────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    const user   = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const salt     = await bcrypt.genSalt(10);
    const newHash  = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [newHash, req.user.id]);

    await logAudit({
      userId:     req.user.id,
      action:     "changed_password",
      entityType: "user",
      entityId:   req.user.id,
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe, changePassword };
