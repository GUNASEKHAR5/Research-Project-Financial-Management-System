const express = require("express");
const router  = express.Router();

const {
  getBudgetsByProject,
  updateBudgetAllocations,
  getBudgetSummary,
} = require("../controllers/budgetController");

const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET  /api/budgets/project/:projectId          — admin, finance
router.get("/project/:projectId", authorize("admin", "finance"), getBudgetsByProject);

// GET  /api/budgets/project/:projectId/summary  — admin, finance
router.get("/project/:projectId/summary", authorize("admin", "finance"), getBudgetSummary);

// PUT  /api/budgets/project/:projectId          — admin only
router.put("/project/:projectId", authorize("admin"), updateBudgetAllocations);

module.exports = router;
