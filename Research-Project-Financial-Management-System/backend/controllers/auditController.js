const pool = require("../config/db");

// ── GET /api/audit ─────────────────────────────────────────────
const getAuditLogs = async (req, res, next) => {
  try {
    const { project_id, user_id, entity_type, limit = 50, offset = 0 } = req.query;
    const params = [];
    const conditions = [];

    if (project_id) {
      params.push(project_id);
      conditions.push(`al.project_id = $${params.length}`);
    }
    if (user_id) {
      params.push(user_id);
      conditions.push(`al.user_id = $${params.length}`);
    }
    if (entity_type) {
      params.push(entity_type);
      conditions.push(`al.entity_type = $${params.length}`);
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    params.push(parseInt(limit));
    params.push(parseInt(offset));

    const result = await pool.query(
      `SELECT
         al.id,
         al.action,
         al.entity_type,
         al.entity_id,
         al.metadata,
         al.created_at,
         u.name  AS user_name,
         u.role  AS user_role,
         p.title AS project_title
       FROM  audit_logs al
       LEFT JOIN users    u ON u.id = al.user_id
       LEFT JOIN projects p ON p.id = al.project_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    // Total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs al ${where}`,
      params.slice(0, params.length - 2)
    );

    res.json({
      success: true,
      data:    result.rows,
      total:   parseInt(countResult.rows[0].count),
      limit:   parseInt(limit),
      offset:  parseInt(offset),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/audit/stats ───────────────────────────────────────
const getAuditStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE action LIKE '%approved%') AS total_approvals,
        COUNT(*) FILTER (WHERE action LIKE '%rejected%') AS total_rejections,
        COUNT(*) FILTER (WHERE action LIKE '%created%')  AS total_created,
        COUNT(*) FILTER (WHERE action LIKE '%submitted%')AS total_submitted,
        COUNT(*)                                          AS total_actions
      FROM audit_logs
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs, getAuditStats };
