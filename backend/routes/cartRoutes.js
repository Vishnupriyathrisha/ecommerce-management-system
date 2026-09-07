const express = require("express");

const {
  addToCart,
  getMyCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", addToCart);

router.get("/", getMyCart);

router.put("/:productId", updateCartItem);

router.delete("/:productId", removeFromCart);

router.delete("/", clearCart);

module.exports = router;