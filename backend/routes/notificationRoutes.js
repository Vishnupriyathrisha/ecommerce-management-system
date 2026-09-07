const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// Get my notifications
router.get("/", authMiddleware, getMyNotifications);

// Mark one notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllAsRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;