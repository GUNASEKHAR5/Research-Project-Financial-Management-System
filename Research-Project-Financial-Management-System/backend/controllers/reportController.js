const pool = require("../config/db");

// ── GET /api/reports/dashboard ────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [stats, monthly, categories, utilization] = await Promise.all([
      // Overall KPI stats
      pool.query(`
        SELECT
          COUNT(DISTINCT p.id)                                        AS total_projects,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')    AS active_projects,
          COALESCE(SUM(b.allocated_amount), 0)                        AS total_budget,
          COALESCE(SUM(b.spent_amount),     0)                        AS total_spent,
          COALESCE(SUM(b.allocated_amount) - SUM(b.spent_amount), 0)  AS remaining,
          (SELECT COUNT(*) FROM expenses WHERE status = 'pending')    AS pending_approvals
        FROM  projects p
        LEFT JOIN budgets b ON b.project_id = p.id
      `),

      // Monthly spending — last 6 months
      pool.query(`
        SELECT
          TO_CHAR(expense_date, 'Mon')     AS month,
          TO_CHAR(expense_date, 'YYYY-MM') AS month_key,
          COALESCE(SUM(amount), 0)         AS total_spent
        FROM  expenses
        WHERE status       = 'approved'
          AND expense_date >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(expense_date, 'Mon'), TO_CHAR(expense_date, 'YYYY-MM')
        ORDER BY month_key
      `),

      // Spending by category
      pool.query(`
        SELECT category, COALESCE(SUM(amount), 0) AS total
        FROM   expenses
        WHERE  status = 'approved'
        GROUP  BY category
        ORDER  BY total DESC
      `),

      // Project utilization
      pool.query(`
        SELECT
          p.id, p.title, p.status,
          COALESCE(SUM(b.allocated_amount), 0) AS total_budget,
          COALESCE(SUM(b.spent_amount),     0) AS total_spent,
          CASE WHEN SUM(b.allocated_amount) = 0 THEN 0
               ELSE ROUND(SUM(b.spent_amount) / SUM(b.allocated_amount) * 100, 1)
          END AS utilization_pct
        FROM  projects p
        LEFT JOIN budgets b ON b.project_id = p.id
        WHERE p.status = 'active'
        GROUP BY p.id
        ORDER BY utilization_pct DESC
      `),
    ]);

    res.json({
      success: true,
      data: {
        stats:       stats.rows[0],
        monthly:     monthly.rows,
        categories:  categories.rows,
        utilization: utilization.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/reports/project-summary ──────────────────────────
const getProjectSummary = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM project_financial_summary ORDER BY title");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/reports/monthly-expense ──────────────────────────
const getMonthlyExpenseReport = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const result = await pool.query(
      `SELECT * FROM monthly_expense_report
       WHERE month >= TO_CHAR(NOW() - INTERVAL '${parseInt(months)} months', 'YYYY-MM')`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/reports/budget-utilization ───────────────────────
const getBudgetUtilization = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM budget_utilization_report ORDER BY utilization_pct DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/reports/agency-funding ───────────────────────────
const getAgencyFundingReport = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM agency_funding_report ORDER BY total_allocated DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/reports/expense-by-category ──────────────────────
const getExpenseByCategory = async (req, res, next) => {
  try {
    const { project_id } = req.query;
    const params = [];
    let where = "WHERE e.status = 'approved'";

    if (project_id) {
      params.push(project_id);
      where += ` AND e.project_id = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
         e.category,
         COUNT(*)     AS expense_count,
         SUM(e.amount) AS total_amount,
         AVG(e.amount) AS avg_amount
       FROM expenses e
       ${where}
       GROUP BY e.category
       ORDER BY total_amount DESC`,
      params
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getProjectSummary,
  getMonthlyExpenseReport,
  getBudgetUtilization,
  getAgencyFundingReport,
  getExpenseByCategory,
};
