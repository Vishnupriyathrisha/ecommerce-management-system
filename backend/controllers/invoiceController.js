const PDFDocument = require("pdfkit");
const Order = require("../models/Order");

// Generate Invoice PDF
const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order with customer details
    const order = await Order.findById(orderId).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Security: User can download only their own invoice
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to access this invoice",
      });
    }

    // Invoice number
    const invoiceNumber = `INV-${order._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;

    // Create PDF
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    // Response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoiceNumber}.pdf`
    );

    // Pipe PDF directly to response
    doc.pipe(res);

    // =========================
    // HEADER
    // =========================

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Invoice Number: ${invoiceNumber}`);

    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`
    );

    doc.moveDown(2);

    // =========================
    // CUSTOMER DETAILS
    // =========================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Customer Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Name: ${order.user?.name || "N/A"}`);

    doc.text(`Email: ${order.user?.email || "N/A"}`);

    doc.text(`Shipping Address: ${order.shippingAddress}`);

    doc.moveDown(2);

    // =========================
    // ORDER ITEMS
    // =========================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Order Items");

    doc.moveDown();

    // Table header
    doc
      .fontSize(10)
      .font("Helvetica-Bold");

    doc.text("Product", 50, doc.y, { width: 180 });
    doc.text("Price", 230, doc.y, { width: 80 });
    doc.text("Qty", 310, doc.y, { width: 60 });
    doc.text("Subtotal", 370, doc.y, { width: 120 });

    doc.moveDown();

    // Line
    doc
      .moveTo(50, doc.y)
      .lineTo(540, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Items
    order.items.forEach((item) => {
      const y = doc.y;

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(item.name, 50, y, { width: 180 });

      doc.text(`Rs. ${item.price.toFixed(2)}`, 230, y, {
        width: 80,
      });

      doc.text(item.quantity.toString(), 310, y, {
        width: 60,
      });

      doc.text(`Rs. ${item.subtotal.toFixed(2)}`, 370, y, {
        width: 120,
      });

      doc.moveDown(1);
    });

    doc.moveDown();

    // =========================
    // TOTALS
    // =========================

    doc
      .moveTo(300, doc.y)
      .lineTo(540, doc.y)
      .stroke();

    doc.moveDown();

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Subtotal: Rs. ${order.subtotal.toFixed(2)}`, {
        align: "right",
      });

    if (order.couponCode) {
      doc.text(`Coupon Code: ${order.couponCode}`, {
        align: "right",
      });
    }

    doc.text(`Discount: Rs. ${order.discount.toFixed(2)}`, {
      align: "right",
    });

    doc.moveDown(0.5);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`Final Total: Rs. ${order.totalAmount.toFixed(2)}`, {
        align: "right",
      });

    doc.moveDown(1.5);

    // =========================
    // PAYMENT DETAILS
    // =========================

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Payment Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Payment Method: ${order.paymentMethod}`);

    doc.text(`Payment Status: ${order.paymentStatus}`);

    doc.moveDown(2);

    // =========================
    // FOOTER
    // =========================

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for your purchase!", {
        align: "center",
      });

    // Finish PDF
    doc.end();
  } catch (error) {
    console.error("Generate Invoice Error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate invoice",
        error: error.message,
      });
    }
  }
};

module.exports = {
  generateInvoice,
};