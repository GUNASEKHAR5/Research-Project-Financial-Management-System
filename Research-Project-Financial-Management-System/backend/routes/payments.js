const express = require("express");
const router  = express.Router();

const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  getPaymentSummary,
} = require("../controllers/paymentController");

const { protect }   = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.use(protect);

// GET  /api/payments/summary   — admin, finance
router.get("/summary", authorize("admin", "finance"), getPaymentSummary);

// GET  /api/payments           — admin, finance
router.get("/", authorize("admin", "finance"), getAllPayments);

// GET  /api/payments/:id       — admin, finance
router.get("/:id", authorize("admin", "finance"), getPaymentById);

// POST /api/payments           — admin, finance
router.post("/", authorize("admin", "finance"), createPayment);

// PUT  /api/payments/:id       — admin, finance
router.put("/:id", authorize("admin", "finance"), updatePayment);

module.exports = router;
