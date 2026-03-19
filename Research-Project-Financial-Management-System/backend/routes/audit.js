const express = require("express");
const router  = express.Router();

const { getAuditLogs, getAuditStats } = require("../controllers/auditController");
const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET /api/audit        — admin only
router.get("/", authorize("admin"), getAuditLogs);

// GET /api/audit/stats  — admin only
router.get("/stats", authorize("admin"), getAuditStats);

module.exports = router;
