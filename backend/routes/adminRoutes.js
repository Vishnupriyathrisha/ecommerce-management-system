const express = require("express");

const {
  createAdmin,
  getBuyers,
  getSellers,
  toggleUserBlock,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin"),
  createAdmin
);

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome to Admin Dashboard",
      admin: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

// Get Buyers
router.get(
  "/buyers",
  authMiddleware,
  roleMiddleware("admin"),
  getBuyers
);

// Get Sellers
router.get(
  "/sellers",
  authMiddleware,
  roleMiddleware("admin"),
  getSellers
);

// Block / Unblock Buyer or Seller
router.put(
  "/users/:id/toggle-block",
  authMiddleware,
  roleMiddleware("admin"),
  toggleUserBlock
);

module.exports = router;