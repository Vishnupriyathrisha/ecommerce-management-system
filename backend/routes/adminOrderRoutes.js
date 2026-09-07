const express = require("express");

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getSalesSummary,
} = require("../controllers/adminOrderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// All orders
router.get("/", getAllOrders);

// Sales summary
router.get("/sales-summary", getSalesSummary);

// Single order
router.get("/:id", getOrderById);

// Update order status
router.put("/:id/status", updateOrderStatus);

module.exports = router;