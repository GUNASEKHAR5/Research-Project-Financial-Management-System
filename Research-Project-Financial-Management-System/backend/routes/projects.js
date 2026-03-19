const express = require("express");
const router  = express.Router();

const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
} = require("../controllers/projectController");

const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET  /api/projects         — all roles
router.get("/", getAllProjects);

// GET  /api/projects/:id     — all roles
router.get("/:id", getProjectById);

// POST /api/projects         — admin only
router.post("/", authorize("admin"), createProject);

// PUT  /api/projects/:id     — admin only
router.put("/:id", authorize("admin"), updateProject);

// PATCH /api/projects/:id/archive  — admin only
router.patch("/:id/archive", authorize("admin"), archiveProject);

module.exports = router;
