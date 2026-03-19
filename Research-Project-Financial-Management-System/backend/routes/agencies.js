const express = require("express");
const router  = express.Router();

const {
  getAllAgencies,
  getAgencyById,
  createAgency,
  updateAgency,
} = require("../controllers/agencyController");

const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET  /api/agencies        — admin, finance
router.get("/", authorize("admin", "finance"), getAllAgencies);

// GET  /api/agencies/:id    — admin, finance
router.get("/:id", authorize("admin", "finance"), getAgencyById);

// POST /api/agencies        — admin only
router.post("/", authorize("admin"), createAgency);

// PUT  /api/agencies/:id    — admin only
router.put("/:id", authorize("admin"), updateAgency);

module.exports = router;
