const express = require("express");
const router  = express.Router();

const { login, register, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", register);

// GET  /api/auth/me  (protected)
router.get("/me", protect, getMe);

// POST /api/auth/change-password  (protected)
router.post("/change-password", protect, changePassword);

module.exports = router;
