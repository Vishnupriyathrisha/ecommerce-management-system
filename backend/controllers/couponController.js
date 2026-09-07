const Coupon = require("../models/Coupon");

// Create Coupon
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountPercentage,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
    } = req.body;

    if (!code || !discountPercentage || !expiryDate) {
      return res.status(400).json({
        message: "Code, discount percentage and expiry date are required",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: "Coupon code already exists",
      });
    }

    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      expiryDate,
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

// Get All Coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

// Update Coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    const {
      discountPercentage,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      isActive,
    } = req.body;

    if (discountPercentage !== undefined) {
      if (discountPercentage < 1 || discountPercentage > 100) {
        return res.status(400).json({
          message: "Discount must be between 1 and 100",
        });
      }

      coupon.discountPercentage = discountPercentage;
    }

    if (minOrderAmount !== undefined) {
      coupon.minOrderAmount = minOrderAmount;
    }

    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount;
    }

    if (expiryDate !== undefined) {
      if (new Date(expiryDate) <= new Date()) {
        return res.status(400).json({
          message: "Expiry date must be in the future",
        });
      }

      coupon.expiryDate = expiryDate;
    }

    if (isActive !== undefined) {
      coupon.isActive = isActive;
    }

    await coupon.save();

    res.status(200).json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update coupon",
      error: error.message,
    });
  }
};

// Delete Coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
};

const Cart = require("../models/Cart");

// Apply Coupon
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        message: "Coupon is inactive",
      });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        message: "Coupon has expired",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    let cartTotal = 0;

    for (const item of cart.items) {
      cartTotal += item.product.price * item.quantity;
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    let discount =
      (cartTotal * coupon.discountPercentage) / 100;

    if (
      coupon.maxDiscountAmount !== null &&
      discount > coupon.maxDiscountAmount
    ) {
      discount = coupon.maxDiscountAmount;
    }

    const finalAmount = cartTotal - discount;

    res.status(200).json({
      message: "Coupon applied successfully",
      couponCode: coupon.code,
      cartTotal,
      discount,
      finalAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};