const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    // Total products
    const totalProducts = await Product.countDocuments({
      isActive: true,
    });

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Orders by status
    const pendingOrders = await Order.countDocuments({
      orderStatus: {
        $in: ["PLACED", "CONFIRMED"],
      },
    });

    const deliveredOrders = await Order.countDocuments({
      orderStatus: "DELIVERED",
    });

    const cancelledOrders = await Order.countDocuments({
      orderStatus: "CANCELLED",
    });

    // Total sales
    const salesResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["CANCELLED"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};

