const Order = require("../models/Order");
const Notification = require("../models/Notification");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Prevent duplicate notification
    const previousStatus = order.orderStatus;

    order.orderStatus = orderStatus;

    await order.save();

    // Create notification based on order status
    if (
      previousStatus !== orderStatus &&
      ["CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
        orderStatus
      )
    ) {
      let title = "";
      let message = "";
      let notificationType = "";

      switch (orderStatus) {
        case "CONFIRMED":
          title = "Order Confirmed";
          message = "Your order has been confirmed successfully.";
          notificationType = "ORDER_CONFIRMED";
          break;

        case "SHIPPED":
          title = "Order Shipped";
          message = "Your order has been shipped and is on the way.";
          notificationType = "ORDER_SHIPPED";
          break;

        case "OUT_FOR_DELIVERY":
          title = "Out for Delivery";
          message = "Your order is out for delivery.";
          notificationType = "OUT_FOR_DELIVERY";
          break;

        case "DELIVERED":
          title = "Order Delivered";
          message = "Your order has been delivered successfully.";
          notificationType = "ORDER_DELIVERED";
          break;

        default:
          break;
      }

      if (notificationType) {
        await Notification.create({
          recipient: order.user,
          title,
          message,
          type: notificationType,
          relatedOrder: order._id,
        });
      }
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Sales summary
const getSalesSummary = async (req, res) => {
  try {
    const orders = await Order.find({
  orderStatus: {
    $ne: "CANCELLED",
  },
  paymentStatus: {
    $ne: "FAILED",
  },
});

    const totalOrders = orders.length;

    const totalSales = orders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayOrders = orders.filter(
      (order) =>
        order.createdAt >= startOfToday &&
        order.createdAt < endOfToday
    );

    const todaySales = todayOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    res.status(200).json({
      totalOrders,
      totalSales,
      todayOrders: todayOrders.length,
      todaySales,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sales summary",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getSalesSummary,
};