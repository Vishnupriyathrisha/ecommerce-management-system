const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Get profile
router.get("/", getMyProfile);

// Update profile
router.put("/", updateMyProfile);

// Change password
router.put("/change-password", changePassword);

module.exports = router;