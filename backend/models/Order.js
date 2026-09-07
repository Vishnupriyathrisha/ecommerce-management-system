const mongoose = require("mongoose");

// =================================
// ORDER ITEM SCHEMA
// =================================
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// =================================
// ORDER SCHEMA
// =================================
const orderSchema = new mongoose.Schema(
  {
    // =================================
    // CUSTOMER
    // =================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =================================
    // ORDER ITEMS
    // =================================
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Order must contain at least one product",
      },
    },

    // =================================
    // PRICE DETAILS
    // =================================

    // Total before coupon discount
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Applied coupon
    couponCode: {
      type: String,
      default: null,
      trim: true,
    },

    // Discount amount
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final amount after discount
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =================================
    // SHIPPING
    // =================================
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================
    // PAYMENT
    // =================================
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // Razorpay Order ID
    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
    },

    // Razorpay Payment ID
    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
    },

    // =================================
    // ORDER STATUS
    // =================================
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },
  },
  {
    timestamps: true,
  }
);

// =================================
// EXPORT MODEL
// =================================
module.exports = mongoose.model("Order", orderSchema);