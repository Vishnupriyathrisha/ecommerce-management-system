const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const sendEmail = require("../utils/sendEmail");

// =====================================================
// CREATE ORDER
// =====================================================
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = "COD",
      couponCode,
    } = req.body;

    // =====================================================
    // VALIDATE SHIPPING ADDRESS
    // =====================================================
    if (!shippingAddress || !shippingAddress.trim()) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    // =====================================================
    // GET USER CART
    // =====================================================
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    // =====================================================
    // CHECK PRODUCTS + CALCULATE SUBTOTAL
    // =====================================================
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: "One or more products are no longer available",
        });
      }

      // IMPORTANT:
      // Order model requires seller.
      if (!product.seller) {
        return res.status(400).json({
          message: `Seller is not assigned for product: ${product.name}. Please update this product with a seller before placing the order.`,
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          message: `Invalid quantity for ${product.name}`,
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // =====================================================
    // COUPON CALCULATION
    // =====================================================
    let discount = 0;
    let appliedCouponCode = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
      });

      if (!coupon) {
        return res.status(400).json({
          message: "Invalid coupon code",
        });
      }

      if (!coupon.isActive) {
        return res.status(400).json({
          message: "Coupon is inactive",
        });
      }

      if (
  coupon.usageLimit !== null &&
  coupon.usedCount >= coupon.usageLimit
) {
  return res.status(400).json({
    message: "Coupon usage limit has been reached",
  });
}

      if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        return res.status(400).json({
          message: "Coupon has expired",
        });
      }

      if (
        coupon.minOrderAmount !== undefined &&
        subtotal < coupon.minOrderAmount
      ) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
        });
      }

      discount =
        (subtotal * coupon.discountPercentage) / 100;

      if (
        coupon.maxDiscountAmount !== null &&
        coupon.maxDiscountAmount !== undefined &&
        discount > coupon.maxDiscountAmount
      ) {
        discount = coupon.maxDiscountAmount;
      }

      appliedCouponCode = coupon.code;
    }

    // =====================================================
    // FINAL AMOUNT
    // =====================================================
    const totalAmount = Math.max(0, subtotal - discount);

    // =====================================================
    // CREATE ORDER
    // =====================================================
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      couponCode: appliedCouponCode,
      discount,
      totalAmount,
      shippingAddress: shippingAddress.trim(),
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    if (appliedCouponCode) {
  await Coupon.findOneAndUpdate(
    { code: appliedCouponCode },
    { $inc: { usedCount: 1 } }
  );
}

    // =====================================================
    // REDUCE STOCK
    // =====================================================
    for (const item of cart.items) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.product._id,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`,
        });
      }

      // =====================================================
      // LOW STOCK NOTIFICATION
      // =====================================================
      if (updatedProduct.stock <= 5) {
        const admins = await User.find({
          role: "admin",
        }).select("_id");

        for (const admin of admins) {
          const existingNotification =
            await Notification.findOne({
              recipient: admin._id,
              type: "LOW_STOCK",
              relatedProduct: updatedProduct._id,
              isRead: false,
            });

          if (!existingNotification) {
            await Notification.create({
              recipient: admin._id,
              title: "Low Stock Alert",
              message: `${updatedProduct.name} has only ${updatedProduct.stock} items left in stock.`,
              type: "LOW_STOCK",
              relatedProduct: updatedProduct._id,
            });
          }
        }
      }
    }

    // =====================================================
    // CLEAR CART
    // =====================================================
    cart.items = [];
    await cart.save();

    // =====================================================
    // SELLER NEW ORDER NOTIFICATIONS
    // =====================================================
    const sellerIds = [
      ...new Set(
        orderItems
          .map((item) => item.seller?.toString())
          .filter(Boolean)
      ),
    ];

    for (const sellerId of sellerIds) {
      await Notification.create({
        recipient: sellerId,
        title: "New Order Received",
        message:
          "You have received a new order containing your product(s).",
        type: "NEW_ORDER",
        relatedOrder: order._id,
      });
    }

    // =====================================================
    // BUYER ORDER PLACED NOTIFICATION
    // =====================================================
    await Notification.create({
      recipient: req.user._id,
      title: "Order Placed",
      message: `Your order has been placed successfully. Order amount: ₹${totalAmount}`,
      type: "ORDER_PLACED",
      relatedOrder: order._id,
    });

    // =====================================================
    // BUYER PURCHASE EMAIL
    // =====================================================
    const buyer = await User.findById(req.user._id).select(
      "name email"
    );

    if (buyer?.email) {
      const productRows = orderItems
        .map(
          (item) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd;">
                ${item.name}
              </td>
              <td style="padding:8px;border-bottom:1px solid #ddd;">
                ${item.quantity}
              </td>
              <td style="padding:8px;border-bottom:1px solid #ddd;">
                ₹${item.subtotal}
              </td>
            </tr>
          `
        )
        .join("");

      await sendEmail({
        to: buyer.email,
        subject: "Order Confirmation - E-Commerce Store",
        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:20px;
          ">

            <h2>Order Confirmed! 🎉</h2>

            <p>
              Hello ${buyer.name || "Customer"},
            </p>

            <p>
              Thank you for your purchase.
              Your order has been placed successfully.
            </p>

            <h3>Order Details</h3>

            <p>
              <strong>Order ID:</strong>
              ${order._id}
            </p>

            <p>
              <strong>Payment Method:</strong>
              ${paymentMethod}
            </p>

            <table style="
              width:100%;
              border-collapse:collapse;
              margin-top:15px;
            ">
              <thead>
                <tr>
                  <th style="padding:8px;text-align:left;">
                    Product
                  </th>

                  <th style="padding:8px;text-align:left;">
                    Quantity
                  </th>

                  <th style="padding:8px;text-align:left;">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                ${productRows}
              </tbody>
            </table>

            <div style="margin-top:20px;">

              <p>
                <strong>Subtotal:</strong>
                ₹${subtotal}
              </p>

              ${
                discount > 0
                  ? `
                    <p>
                      <strong>Discount:</strong>
                      -₹${discount}
                    </p>
                  `
                  : ""
              }

              <p style="font-size:18px;">
                <strong>Total Amount:</strong>
                ₹${totalAmount}
              </p>

            </div>

            <h3>Shipping Address</h3>

            <p>
              ${shippingAddress}
            </p>

            <p style="margin-top:25px;">
              Thank you for shopping with us! 🛍️
            </p>

          </div>
        `,
      });
    }

    // =====================================================
    // POPULATE ORDER
    // =====================================================
    const populatedOrder =
      await Order.findById(order._id)
        .populate("user", "name email")
        .populate(
          "items.product",
          "name price image category"
        )
        .populate(
          "items.seller",
          "name email"
        );

    // =====================================================
    // RESPONSE
    // =====================================================
    return res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    });

  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate(
        "items.product",
        "name price image category"
      )
      .populate(
        "items.seller",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE MY ORDER
// =====================================================
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate(
        "items.product",
        "name price image category"
      )
      .populate(
        "items.seller",
        "name email"
      )
      .populate(
        "user",
        "name email"
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      order,
    });

  } catch (error) {
    console.error("Get Single Order Error:", error);

    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// =====================================================
// CANCEL ORDER
// =====================================================
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only placed / confirmed orders can be cancelled
    if (
      !["PLACED", "CONFIRMED"].includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled at this stage",
      });
    }

    // =====================================================
    // RESTORE STOCK
    // =====================================================
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================
    order.orderStatus = "CANCELLED";

    if (order.paymentStatus === "PENDING") {
      order.paymentStatus = "FAILED";
    }

    await order.save();

    // =====================================================
    // CANCEL NOTIFICATION
    // =====================================================
    await Notification.create({
      recipient: req.user._id,
      title: "Order Cancelled",
      message:
        "Your order has been cancelled successfully.",
      type: "ORDER_CANCELLED",
      relatedOrder: order._id,
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// =====================================================
// SELLER ORDERS
// =====================================================
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({
      "items.seller": sellerId,
    })
      .populate(
        "user",
        "name email"
      )
      .populate(
        "items.product",
        "name price image category"
      )
      .populate(
        "items.seller",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error("Get Seller Orders Error:", error);

    return res.status(500).json({
      message: "Failed to fetch seller orders",
      error: error.message,
    });
  }
};

// =====================================================
// SELLER UPDATE ORDER STATUS
// =====================================================
const updateSellerOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "CONFIRMED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findOne({
      _id: id,
      "items.seller": req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    // =====================================================
    // CUSTOMER NOTIFICATION
    // =====================================================
    await Notification.create({
      recipient: order.user,
      title: "Order Status Updated",
      message: `Your order status is now ${orderStatus.replaceAll(
        "_",
        " "
      )}`,
      type: "ORDER_STATUS_UPDATED",
      relatedOrder: order._id,
    });

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.error(
      "Update Seller Order Status Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// =====================================================
// SELLER SALES
// =====================================================
const getSellerSales = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({
      "items.seller": sellerId,
      orderStatus: "DELIVERED",
    });

    let totalSales = 0;
    let totalItems = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (
          item.seller &&
          item.seller.toString() ===
            sellerId.toString()
        ) {
          totalSales += item.subtotal;
          totalItems += item.quantity;
        }
      });
    });

    return res.status(200).json({
      totalOrders: orders.length,
      totalItems,
      totalSales,
    });

  } catch (error) {
    console.error(
      "Get Seller Sales Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch seller sales",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN SELLER SALES
// =====================================================
const getAdminSellerSales = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: "DELIVERED",
    }).populate(
      "items.seller",
      "name email"
    );

    const sellerStats = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.seller) return;

        const sellerId =
          item.seller._id.toString();

        if (!sellerStats[sellerId]) {
          sellerStats[sellerId] = {
            sellerId,
            sellerName: item.seller.name,
            sellerEmail: item.seller.email,
            orders: 0,
            items: 0,
            sales: 0,
          };
        }

        sellerStats[sellerId].orders += 1;
        sellerStats[sellerId].items += item.quantity;
        sellerStats[sellerId].sales += item.subtotal;
      });
    });

    return res.status(200).json({
      sellers: Object.values(sellerStats),
    });

  } catch (error) {
    console.error(
      "Admin Seller Sales Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch seller sales",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN SELLER ORDERS
// =====================================================
const getAdminSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({
      "items.seller": sellerId,
    })
      .populate(
        "user",
        "name email"
      )
      .populate(
        "items.product",
        "name price image category"
      )
      .populate(
        "items.seller",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(
      "Admin Seller Orders Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch seller orders",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerSales,
  getAdminSellerSales,
  getAdminSellerOrders,
};