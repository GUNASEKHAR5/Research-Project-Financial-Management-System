const express = require("express");
const router  = express.Router();

const {
  getDashboardStats,
  getProjectSummary,
  getMonthlyExpenseReport,
  getBudgetUtilization,
  getAgencyFundingReport,
  getExpenseByCategory,
} = require("../controllers/reportController");

const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET /api/reports/dashboard           — all roles
router.get("/dashboard", getDashboardStats);

// GET /api/reports/project-summary     — admin, finance
router.get("/project-summary", authorize("admin", "finance"), getProjectSummary);

// GET /api/reports/monthly-expense     — admin, finance
router.get("/monthly-expense", authorize("admin", "finance"), getMonthlyExpenseReport);

// GET /api/reports/budget-utilization  — admin, finance
router.get("/budget-utilization", authorize("admin", "finance"), getBudgetUtilization);

// GET /api/reports/agency-funding      — admin, finance
router.get("/agency-funding", authorize("admin", "finance"), getAgencyFundingReport);

// GET /api/reports/expense-by-category — admin, finance
router.get("/expense-by-category", authorize("admin", "finance"), getExpenseByCategory);

module.exports = router;
