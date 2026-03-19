const pool = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

// ── GET /api/expenses ──────────────────────────────────────────
const getAllExpenses = async (req, res, next) => {
  try {
    const { status, project_id, category } = req.query;
    const params = [];
    const conditions = [];

    // Faculty only sees their own submissions
    if (req.user.role === "faculty") {
      params.push(req.user.id);
      conditions.push(`e.submitted_by = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`e.status = $${params.length}`);
    }

    if (project_id) {
      params.push(project_id);
      conditions.push(`e.project_id = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`e.category = $${params.length}`);
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const result = await pool.query(
      `SELECT
         e.id, e.amount, e.category, e.description,
         e.expense_date, e.status, e.submitted_at, e.reviewed_at,
         p.id   AS project_id,
         p.title AS project_title,
         u.id   AS submitted_by_id,
         u.name AS submitted_by_name,
         EXISTS (SELECT 1 FROM invoices i WHERE i.expense_id = e.id) AS has_receipt
       FROM  expenses e
       JOIN  projects p ON p.id = e.project_id
       JOIN  users    u ON u.id = e.submitted_by
       ${where}
       ORDER BY e.submitted_at DESC`,
      params
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/expenses/:id ──────────────────────────────────────
const getExpenseById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         e.*,
         p.title AS project_title,
         u.name  AS submitted_by_name,
         u.email AS submitted_by_email
       FROM  expenses e
       JOIN  projects p ON p.id = e.project_id
       JOIN  users    u ON u.id = e.submitted_by
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Fetch invoices for this expense
    const invoices = await pool.query(
      "SELECT * FROM invoices WHERE expense_id = $1",
      [req.params.id]
    );

    // Fetch approval history
    const approvals = await pool.query(
      `SELECT a.*, u.name AS reviewer_name, u.role AS reviewer_role
       FROM   approvals a
       JOIN   users     u ON u.id = a.reviewed_by
       WHERE  a.expense_id = $1
       ORDER  BY a.reviewed_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        invoices:  invoices.rows,
        approvals: approvals.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/expenses ─────────────────────────────────────────
const createExpense = async (req, res, next) => {
  try {
    const { project_id, category, amount, description, expense_date } = req.body;

    if (!project_id || !category || !amount || !expense_date) {
      return res.status(400).json({ success: false, message: "project_id, category, amount, expense_date are required" });
    }

    // Get budget_id for this project+category
    const budgetResult = await pool.query(
      "SELECT id FROM budgets WHERE project_id = $1 AND category = $2",
      [project_id, category]
    );

    if (budgetResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Budget category not found for this project" });
    }

    const budget_id = budgetResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO expenses (project_id, budget_id, submitted_by, category, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [project_id, budget_id, req.user.id, category, amount, description || null, expense_date]
    );

    const expense = result.rows[0];

    await logAudit({
      userId:     req.user.id,
      projectId:  project_id,
      action:     "submitted_expense",
      entityType: "expense",
      entityId:   expense.id,
      metadata:   { amount, category, expense_date },
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/expenses/:id/approve ────────────────────────────
const approveExpense = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    await client.query("BEGIN");

    const expenseResult = await client.query(
      "SELECT * FROM expenses WHERE id = $1",
      [id]
    );

    if (expenseResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const expense = expenseResult.rows[0];

    if (expense.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: `Expense is already ${expense.status}` });
    }

    // Update expense status — trigger fn_sync_budget_spent fires here
    await client.query(
      "UPDATE expenses SET status = 'approved', reviewed_at = NOW() WHERE id = $1",
      [id]
    );

    // Insert approval record
    await client.query(
      `INSERT INTO approvals (expense_id, reviewed_by, action, remarks)
       VALUES ($1, $2, 'approved', $3)`,
      [id, req.user.id, remarks || null]
    );

    await client.query("COMMIT");

    await logAudit({
      userId:     req.user.id,
      projectId:  expense.project_id,
      action:     "approved_expense",
      entityType: "expense",
      entityId:   id,
      metadata:   { old_status: "pending", new_status: "approved", amount: expense.amount },
    });

    res.json({ success: true, message: "Expense approved successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

// ── POST /api/expenses/:id/reject ─────────────────────────────
const rejectExpense = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    await client.query("BEGIN");

    const expenseResult = await client.query(
      "SELECT * FROM expenses WHERE id = $1",
      [id]
    );

    if (expenseResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const expense = expenseResult.rows[0];

    if (expense.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: `Expense is already ${expense.status}` });
    }

    // Update status — trigger fires (pending→rejected = no budget change)
    await client.query(
      "UPDATE expenses SET status = 'rejected', reviewed_at = NOW() WHERE id = $1",
      [id]
    );

    await client.query(
      `INSERT INTO approvals (expense_id, reviewed_by, action, remarks)
       VALUES ($1, $2, 'rejected', $3)`,
      [id, req.user.id, remarks || null]
    );

    await client.query("COMMIT");

    await logAudit({
      userId:     req.user.id,
      projectId:  expense.project_id,
      action:     "rejected_expense",
      entityType: "expense",
      entityId:   id,
      metadata:   { old_status: "pending", new_status: "rejected", remarks },
    });

    res.json({ success: true, message: "Expense rejected" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { getAllExpenses, getExpenseById, createExpense, approveExpense, rejectExpense };
