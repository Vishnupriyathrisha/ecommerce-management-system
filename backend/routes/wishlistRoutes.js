const express = require("express");

const {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  moveToCart,
} = require("../controllers/wishlistController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Add product
router.post("/", addToWishlist);

// Get my wishlist
router.get("/", getMyWishlist);

// Remove product
router.delete("/:productId", removeFromWishlist);

//MoveTo Cart
router.post("/:productId/move-to-cart", moveToCart);

module.exports = router;