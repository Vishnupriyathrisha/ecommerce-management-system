const express = require("express");

const {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get reviews for a product
router.get("/product/:productId", getProductReviews);

// User must be logged in for these
router.post("/product/:productId", authMiddleware, addReview);

router.put("/:reviewId", authMiddleware, updateReview);

router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;