const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =================================
// CREATE ADMIN
// =================================
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

// =================================
// GET BUYERS
// =================================
const getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Buyers fetched successfully",
      buyers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch buyers",
      error: error.message,
    });
  }
};

// =================================
// GET SELLERS
// =================================
const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sellers fetched successfully",
      sellers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sellers",
      error: error.message,
    });
  }
};

// =================================
// BLOCK / UNBLOCK USER
// =================================
const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Admin-a block panna allow pannakoodathu
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin cannot be blocked",
      });
    }

    user.isBlocked = !user.isBlocked;

    await user.save();

    res.status(200).json({
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

module.exports = {
  createAdmin,
  getBuyers,
  getSellers,
  toggleUserBlock,
};