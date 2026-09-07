const express = require("express");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerSales,
  getAdminSellerSales,
  getAdminSellerOrders,
} = require("../controllers/orderController");

const { createPaymentOrder, verifyPayment, } = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Place order
router.post("/", createOrder);

// My purchase history
router.get("/my-orders", getMyOrders);

// Seller Orders
router.get("/seller/orders", roleMiddleware("seller"), getSellerOrders);

router.put(
  "/seller/:id/status",
  roleMiddleware("seller"),
  updateSellerOrderStatus
);

router.get("/seller/sales", roleMiddleware("seller"), getSellerSales);

router.get(
  "/admin/seller-sales",
  roleMiddleware("admin"),
  getAdminSellerSales
);

router.get(
  "/admin/seller/:sellerId/orders",
  roleMiddleware("admin"),
  getAdminSellerOrders
);

// Single order
router.get("/:id", getMyOrderById);

// Order cancel
router.put("/:id/cancel", cancelOrder);

// Razorpay payment
router.post("/payment/create", createPaymentOrder);
router.post("/payment/verify", verifyPayment);

module.exports = router;