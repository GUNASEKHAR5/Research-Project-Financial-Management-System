const pool = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── GET /api/budgets/project/:projectId ───────────────────────
const getBudgetsByProject = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         b.*,
         CASE WHEN b.allocated_amount = 0 THEN 0
              ELSE ROUND((b.spent_amount / b.allocated_amount) * 100, 2)
         END AS utilization_pct
       FROM  budgets b
       WHERE project_id = $1
       ORDER BY category`,
      [req.params.projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No budget found for this project" });
    }

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/budgets/project/:projectId ───────────────────────
// Body: [{ category: "equipment", allocated_amount: 1500000 }, ...]
const updateBudgetAllocations = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const { allocations } = req.body; // array of { category, allocated_amount }

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ success: false, message: "allocations array is required" });
    }

    // Verify project exists
    const project = await client.query("SELECT id, title FROM projects WHERE id = $1", [projectId]);
    if (project.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await client.query("BEGIN");

    const updated = [];
    for (const alloc of allocations) {
      const { category, allocated_amount } = alloc;

      if (allocated_amount < 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Allocated amount cannot be negative" });
      }

      const result = await client.query(
        `UPDATE budgets
         SET  allocated_amount = $1, updated_at = NOW()
         WHERE project_id = $2 AND category = $3
         RETURNING *`,
        [allocated_amount, projectId, category]
      );
      if (result.rows.length > 0) updated.push(result.rows[0]);
    }

    await client.query("COMMIT");

    await logAudit({
      userId:     req.user.id,
      projectId:  projectId,
      action:     "updated_budget",
      entityType: "budget",
      entityId:   projectId,
      metadata:   { allocations },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

// ── GET /api/budgets/project/:projectId/summary ───────────────
const getBudgetSummary = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         SUM(allocated_amount) AS total_allocated,
         SUM(spent_amount)     AS total_spent,
         SUM(allocated_amount) - SUM(spent_amount) AS remaining
       FROM budgets
       WHERE project_id = $1`,
      [req.params.projectId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBudgetsByProject, updateBudgetAllocations, getBudgetSummary };
