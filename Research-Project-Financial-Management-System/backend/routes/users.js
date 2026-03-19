const express = require("express");
const router  = express.Router();

const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect }    = require("../middleware/auth");
const { authorize }  = require("../middleware/roles");

// All user routes require login
router.use(protect);

// GET  /api/users          — admin only
router.get("/", authorize("admin"), getAllUsers);

// GET  /api/users/:id      — admin only
router.get("/:id", authorize("admin"), getUserById);

// POST /api/users          — admin only
router.post("/", authorize("admin"), createUser);

// PUT  /api/users/:id      — admin only
router.put("/:id", authorize("admin"), updateUser);

// DELETE /api/users/:id   — admin only (soft-delete)
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
