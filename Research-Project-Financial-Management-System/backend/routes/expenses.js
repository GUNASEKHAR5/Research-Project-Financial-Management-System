const express = require("express");
const router  = express.Router();

const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  approveExpense,
  rejectExpense,
} = require("../controllers/expenseController");

const { getApprovalsByExpense, getApprovalStats } = require("../controllers/approvalController");

const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET  /api/expenses                    — all roles (faculty sees own only)
router.get("/", getAllExpenses);

// GET  /api/expenses/:id                — all roles
router.get("/:id", getExpenseById);

// POST /api/expenses                    — all roles (faculty submits)
router.post("/", createExpense);

// POST /api/expenses/:id/approve        — admin, finance
router.post("/:id/approve", authorize("admin", "finance"), approveExpense);

// POST /api/expenses/:id/reject         — admin, finance
router.post("/:id/reject", authorize("admin", "finance"), rejectExpense);

// GET  /api/expenses/:id/approvals      — all roles
router.get("/:expenseId/approvals", getApprovalsByExpense);

// GET  /api/expenses/approval-stats     — admin, finance
router.get("/meta/approval-stats", authorize("admin", "finance"), getApprovalStats);

module.exports = router;
