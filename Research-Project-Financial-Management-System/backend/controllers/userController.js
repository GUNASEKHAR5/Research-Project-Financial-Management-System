const bcrypt = require("bcryptjs");
const pool   = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── GET /api/users ─────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM   users
       ORDER  BY role, name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users  (admin creates user) ─────────────────────
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), hash, role]
    );

    const newUser = result.rows[0];

    await logAudit({
      userId:     req.user.id,
      action:     "created_user",
      entityType: "user",
      entityId:   newUser.id,
      metadata:   { name: newUser.name, role: newUser.role },
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/:id ─────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, is_active } = req.body;
    const { id } = req.params;

    const existing = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE users
       SET  name       = $1,
            email      = $2,
            role       = $3,
            is_active  = $4,
            updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, role, is_active, updated_at`,
      [
        name      ?? current.name,
        email     ?? current.email,
        role      ?? current.role,
        is_active ?? current.is_active,
        id,
      ]
    );

    await logAudit({
      userId:     req.user.id,
      action:     "updated_user",
      entityType: "user",
      entityId:   id,
      metadata:   { changes: req.body },
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/:id  (soft delete — deactivate) ─────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot deactivate your own account" });
    }

    const result = await pool.query(
      "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, name",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await logAudit({
      userId:     req.user.id,
      action:     "deactivated_user",
      entityType: "user",
      entityId:   id,
    });

    res.json({ success: true, message: "User deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
