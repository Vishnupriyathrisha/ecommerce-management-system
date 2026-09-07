const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin Dashboard
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardStats
);

module.exports = router;

