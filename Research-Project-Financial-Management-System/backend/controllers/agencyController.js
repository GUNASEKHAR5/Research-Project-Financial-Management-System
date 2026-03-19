const pool = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── GET /api/agencies ──────────────────────────────────────────
const getAllAgencies = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         fa.*,
         COUNT(DISTINCT p.id)          AS project_count,
         COALESCE(SUM(b.allocated_amount), 0) AS total_allocated,
         COALESCE(
           (SELECT SUM(py.amount)
            FROM   payments py
            WHERE  py.agency_id = fa.id
              AND  py.status = 'received'), 0
         ) AS total_received
       FROM       funding_agencies fa
       LEFT JOIN  projects         p  ON p.agency_id = fa.id
       LEFT JOIN  budgets          b  ON b.project_id = p.id
       GROUP BY   fa.id
       ORDER BY   fa.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/agencies/:id ──────────────────────────────────────
const getAgencyById = async (req, res, next) => {
  try {
    const agency = await pool.query(
      "SELECT * FROM funding_agencies WHERE id = $1",
      [req.params.id]
    );

    if (agency.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }

    // Fetch projects funded by this agency
    const projects = await pool.query(
      `SELECT
         p.id, p.title, p.status,
         SUM(b.allocated_amount) AS total_budget,
         SUM(b.spent_amount)     AS total_spent
       FROM  projects p
       LEFT JOIN budgets b ON b.project_id = p.id
       WHERE p.agency_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...agency.rows[0], projects: projects.rows },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/agencies ─────────────────────────────────────────
const createAgency = async (req, res, next) => {
  try {
    const { name, full_name, contact_email, contact_phone, address } = req.body;

    if (!name || !full_name) {
      return res.status(400).json({ success: false, message: "name and full_name are required" });
    }

    const result = await pool.query(
      `INSERT INTO funding_agencies (name, full_name, contact_email, contact_phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim().toUpperCase(), full_name.trim(), contact_email || null, contact_phone || null, address || null]
    );

    const agency = result.rows[0];

    await logAudit({
      userId:     req.user.id,
      action:     "created_agency",
      entityType: "user",
      entityId:   agency.id,
      metadata:   { name: agency.name },
    });

    res.status(201).json({ success: true, data: agency });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/agencies/:id ──────────────────────────────────────
const updateAgency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, full_name, contact_email, contact_phone, address } = req.body;

    const existing = await pool.query("SELECT * FROM funding_agencies WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }
    const a = existing.rows[0];

    const result = await pool.query(
      `UPDATE funding_agencies
       SET  name          = $1,
            full_name     = $2,
            contact_email = $3,
            contact_phone = $4,
            address       = $5
       WHERE id = $6
       RETURNING *`,
      [
        name          ?? a.name,
        full_name     ?? a.full_name,
        contact_email ?? a.contact_email,
        contact_phone ?? a.contact_phone,
        address       ?? a.address,
        id,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllAgencies, getAgencyById, createAgency, updateAgency };
