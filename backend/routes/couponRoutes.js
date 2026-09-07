const express = require("express");

const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../controllers/couponController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// User - Apply Coupon
router.post("/apply", authMiddleware, applyCoupon);

// Admin routes
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.post("/", createCoupon);

router.get("/", getAllCoupons);

router.put("/:id", updateCoupon);

router.delete("/:id", deleteCoupon);

module.exports = router;