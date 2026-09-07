const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyOtp,
  verifyLoginOtp,
  loginUser,
  getUsers,
  updateUser,
  getUserById,
  deleteUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/verify-otp", verifyOtp);

router.post("/login", loginUser);

router.post("/verifyloginotp", verifyLoginOtp);

router.post("/users", getUsers);

// Protected Route
router.get("/user", authMiddleware, getUserById);

router.post("/updateUser", updateUser);

router.post("/deleteUser", deleteUser);

module.exports = router;