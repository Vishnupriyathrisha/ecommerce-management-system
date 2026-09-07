const express = require("express");

const {
  register,
  registerSeller,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// REGISTER
// ===============================
router.post("/register", register);

// ===============================
// SELLER REGISTER
// ===============================
router.post("/register-seller", registerSeller);

// ===============================
// LOGIN
// ===============================
router.post("/login", login);

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/forgot-password", forgotPassword);

// ===============================
// RESET PASSWORD
// ===============================
router.put("/reset-password/:token", resetPassword);

// ===============================
// GET PROFILE
// ===============================
router.get("/profile", authMiddleware, getProfile);

// ===============================
// UPDATE PROFILE
// ===============================
router.put("/profile", authMiddleware, updateProfile);

// ===============================
// CHANGE PASSWORD
// ===============================
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;