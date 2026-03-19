const pool = require("../config/db");

// ── GET /api/approvals/expense/:expenseId ─────────────────────
const getApprovalsByExpense = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         a.*,
         u.name AS reviewer_name,
         u.role AS reviewer_role
       FROM   approvals a
       JOIN   users     u ON u.id = a.reviewed_by
       WHERE  a.expense_id = $1
       ORDER  BY a.reviewed_at DESC`,
      [req.params.expenseId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/approvals/stats ───────────────────────────────────
const getApprovalStats = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         u.name,
         u.role,
         COUNT(*) FILTER (WHERE a.action = 'approved') AS total_approved,
         COUNT(*) FILTER (WHERE a.action = 'rejected') AS total_rejected,
         COUNT(*)                                       AS total_reviewed
       FROM  approvals a
       JOIN  users     u ON u.id = a.reviewed_by
       GROUP BY u.id, u.name, u.role
       ORDER BY total_reviewed DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getApprovalsByExpense, getApprovalStats };
