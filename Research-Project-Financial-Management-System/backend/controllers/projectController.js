const pool = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── GET /api/projects ──────────────────────────────────────────
const getAllProjects = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        p.id, p.title, p.description, p.status,
        p.start_date, p.end_date, p.created_at,
        fa.id   AS agency_id,
        fa.name AS agency_name,
        u.id    AS pi_id,
        u.name  AS pi_name,
        COALESCE(SUM(b.allocated_amount), 0) AS total_budget,
        COALESCE(SUM(b.spent_amount),     0) AS total_spent
      FROM       projects         p
      JOIN       funding_agencies fa ON fa.id = p.agency_id
      JOIN       users            u  ON u.id  = p.pi_user_id
      LEFT JOIN  budgets          b  ON b.project_id = p.id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE p.status = $${params.length}`;
    }

    // Faculty sees only their own projects
    if (req.user.role === "faculty") {
      params.push(req.user.id);
      query += params.length === 1 ? " WHERE" : " AND";
      query += ` p.pi_user_id = $${params.length}`;
    }

    query += " GROUP BY p.id, fa.id, u.id ORDER BY p.created_at DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id ──────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         p.*,
         fa.name         AS agency_name,
         fa.full_name    AS agency_full_name,
         fa.contact_email,
         u.name          AS pi_name,
         u.email         AS pi_email,
         COALESCE(SUM(b.allocated_amount), 0) AS total_budget,
         COALESCE(SUM(b.spent_amount),     0) AS total_spent
       FROM       projects         p
       JOIN       funding_agencies fa ON fa.id = p.agency_id
       JOIN       users            u  ON u.id  = p.pi_user_id
       LEFT JOIN  budgets          b  ON b.project_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, fa.id, u.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/projects ─────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { title, description, agency_id, pi_user_id, start_date, end_date } = req.body;

    if (!title || !agency_id || !pi_user_id || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: "title, agency_id, pi_user_id, start_date, end_date are required" });
    }

    const result = await pool.query(
      `INSERT INTO projects (title, description, agency_id, pi_user_id, created_by, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title.trim(), description || null, agency_id, pi_user_id, req.user.id, start_date, end_date]
    );

    const project = result.rows[0];

    await logAudit({
      userId:     req.user.id,
      projectId:  project.id,
      action:     "created_project",
      entityType: "project",
      entityId:   project.id,
      metadata:   { title: project.title, agency_id, pi_user_id },
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/projects/:id ──────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, agency_id, pi_user_id, start_date, end_date, status } = req.body;

    const existing = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const p = existing.rows[0];

    const result = await pool.query(
      `UPDATE projects
       SET  title       = $1,
            description = $2,
            agency_id   = $3,
            pi_user_id  = $4,
            start_date  = $5,
            end_date    = $6,
            status      = $7,
            updated_at  = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title       ?? p.title,
        description ?? p.description,
        agency_id   ?? p.agency_id,
        pi_user_id  ?? p.pi_user_id,
        start_date  ?? p.start_date,
        end_date    ?? p.end_date,
        status      ?? p.status,
        id,
      ]
    );

    await logAudit({
      userId:     req.user.id,
      projectId:  id,
      action:     "updated_project",
      entityType: "project",
      entityId:   id,
      metadata:   { changes: req.body },
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/projects/:id/archive ───────────────────────────
const archiveProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE projects SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING id, title, status",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await logAudit({
      userId:     req.user.id,
      projectId:  id,
      action:     "archived_project",
      entityType: "project",
      entityId:   id,
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, archiveProject };
