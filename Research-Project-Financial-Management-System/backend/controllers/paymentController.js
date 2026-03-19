const pool = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── GET /api/payments ──────────────────────────────────────────
const getAllPayments = async (req, res, next) => {
  try {
    const { status, project_id } = req.query;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`py.status = $${params.length}`);
    }

    if (project_id) {
      params.push(project_id);
      conditions.push(`py.project_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const result = await pool.query(
      `SELECT
         py.*,
         p.title  AS project_title,
         fa.name  AS agency_name,
         u.name   AS recorded_by_name
       FROM  payments         py
       JOIN  projects         p  ON p.id  = py.project_id
       JOIN  funding_agencies fa ON fa.id = py.agency_id
       JOIN  users            u  ON u.id  = py.recorded_by
       ${where}
       ORDER BY py.payment_date DESC`,
      params
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/:id ──────────────────────────────────────
const getPaymentById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         py.*,
         p.title  AS project_title,
         fa.name  AS agency_name,
         fa.full_name AS agency_full_name,
         u.name   AS recorded_by_name
       FROM  payments         py
       JOIN  projects         p  ON p.id  = py.project_id
       JOIN  funding_agencies fa ON fa.id = py.agency_id
       JOIN  users            u  ON u.id  = py.recorded_by
       WHERE py.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payments ─────────────────────────────────────────
const createPayment = async (req, res, next) => {
  try {
    const { project_id, agency_id, amount, payment_type, payment_date, status, remarks } = req.body;

    if (!project_id || !agency_id || !amount || !payment_type || !payment_date) {
      return res.status(400).json({ success: false, message: "project_id, agency_id, amount, payment_type, payment_date are required" });
    }

    const result = await pool.query(
      `INSERT INTO payments (project_id, agency_id, recorded_by, amount, payment_type, payment_date, status, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [project_id, agency_id, req.user.id, amount, payment_type, payment_date, status || "pending", remarks || null]
    );

    const payment = result.rows[0];

    await logAudit({
      userId:     req.user.id,
      projectId:  project_id,
      action:     "recorded_payment",
      entityType: "payment",
      entityId:   payment.id,
      metadata:   { amount, payment_type, status: payment.status },
    });

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/payments/:id ──────────────────────────────────────
const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, payment_type, payment_date, status, remarks } = req.body;

    const existing = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    const py = existing.rows[0];

    const result = await pool.query(
      `UPDATE payments
       SET  amount       = $1,
            payment_type = $2,
            payment_date = $3,
            status       = $4,
            remarks      = $5
       WHERE id = $6
       RETURNING *`,
      [
        amount       ?? py.amount,
        payment_type ?? py.payment_type,
        payment_date ?? py.payment_date,
        status       ?? py.status,
        remarks      ?? py.remarks,
        id,
      ]
    );

    await logAudit({
      userId:     req.user.id,
      projectId:  py.project_id,
      action:     "updated_payment",
      entityType: "payment",
      entityId:   id,
      metadata:   { changes: req.body },
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/summary ──────────────────────────────────
const getPaymentSummary = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        SUM(amount) FILTER (WHERE status = 'received') AS total_received,
        SUM(amount) FILTER (WHERE status = 'pending')  AS total_pending,
        COUNT(*)    FILTER (WHERE status = 'received') AS received_count,
        COUNT(*)    FILTER (WHERE status = 'pending')  AS pending_count
      FROM payments
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPayments, getPaymentById, createPayment, updatePayment, getPaymentSummary };
