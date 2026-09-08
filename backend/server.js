// Load environment variables FIRST
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const User = require("./models/User");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const { setIO } = require("./config/socket");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const profileRoutes = require("./routes/profileRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");
const adminSupportTicketRoutes = require("./routes/adminSupportTicketRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const addressRoutes = require("./routes/addressRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make Socket.IO available to controllers
setIO(io);

// Database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());

// Socket.IO Authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// Socket connection
io.on("connection", (socket) => {
  console.log(
    `User connected: ${socket.user.name} (${socket.user.role})`
  );

  // Personal notification room
  socket.join(`user_${socket.user._id}`);

  // Join support ticket room
  socket.on("join_ticket", (ticketId) => {
    socket.join(`ticket_${ticketId}`);

    console.log(
      `${socket.user.name} joined ticket room: ${ticketId}`
    );
  });

  // Leave support ticket room
  socket.on("leave_ticket", (ticketId) => {
    socket.leave(`ticket_${ticketId}`);

    console.log(
      `${socket.user.name} left ticket room: ${ticketId}`
    );
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.user.name}`
    );
  });
});

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce Management System API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/profile", profileRoutes);

app.use(
  "/api/support-tickets",
  supportTicketRoutes
);

app.use(
  "/api/admin/support-tickets",
  adminSupportTicketRoutes
);

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});