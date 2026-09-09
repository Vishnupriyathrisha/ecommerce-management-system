const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
  return res.status(400).json({
    message: "Password must be at least 6 characters",
  });
}
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    console.log("LOGIN USER:", user?.email);
    console.log("IS BLOCKED:", user?.isBlocked);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isBlocked) {
  return res.status(403).json({
    message: "Your account has been blocked by the admin",
  });
}

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ===============================
// GET USER PROFILE
// ===============================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE USER PROFILE
// ===============================
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check email already used by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Generic response for security
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing in database
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();
   
    const resetUrl =`https://ecommerce-management-system-rho.vercel.app/reset-password/${resetToken}`;

    await sendEmail({
    to: user.email,
    subject: "Password Reset Request - E-Commerce Store",
    html: `
    <h2>Password Reset</h2>
    <p>You requested to reset your password.</p>
    <p>This link will expire in 15 minutes.</p>
    <a href="${resetUrl}">
      Reset Password
    </a>
    <p>If you did not request this, please ignore this email.</p>`,
});
    // TODO: Send resetToken through email
    // Do NOT return resetToken in API response

    res.status(200).json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

// ===============================
// SELLER REGISTRATION
// ===============================
const registerSeller = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: "seller",
      isBlocked: false,
    });

    res.status(201).json({
      message: "Seller registration successful",
      user: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Seller registration failed",
      error: error.message,
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash received token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password

    console.log("Resetting password for:", user.email);
 console.log("New password length:", newPassword.length);
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  registerSeller,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
   
};