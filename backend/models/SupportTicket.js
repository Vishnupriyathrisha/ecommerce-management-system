const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    // ======================================================
    // Ticket creator / Buyer
    // ======================================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // Main Admin / Seller handling the ticket
    // ======================================================
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================================================
    // All users participating in this ticket chat
    // Buyer + Admin + Seller
    // ======================================================
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ======================================================
    // Ticket subject
    // ======================================================
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // Original ticket message
    // ======================================================
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // Old admin reply field
    // ======================================================
    adminReply: {
      type: String,
      default: "",
    },

    // ======================================================
    // Ticket status
    // ======================================================
    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);