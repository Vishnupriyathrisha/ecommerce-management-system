const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ======================================================
// GET ALL SUPPORT TICKETS
// ======================================================
const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("user", "name email phone role")
      .populate("assignedTo", "name email role")
      .populate("participants", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("GET ALL SUPPORT TICKETS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE TICKET
// ======================================================
const getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("user", "name email phone role address")
      .populate("assignedTo", "name email role")
      .populate("participants", "name email role");

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error("GET SINGLE SUPPORT TICKET ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch support ticket",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN REPLY
// ======================================================
const replyToTicket = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply?.trim()) {
      return res.status(400).json({
        message: "Admin reply is required",
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    // Make sure current admin is a participant
    if (!ticket.participants) {
      ticket.participants = [];
    }

    const adminExists = ticket.participants.some(
      (participant) =>
        participant.toString() === req.user._id.toString()
    );

    if (!adminExists) {
      ticket.participants.push(req.user._id);
    }

    ticket.adminReply = adminReply.trim();
    ticket.status = "IN_PROGRESS";

    await ticket.save();

    // Notify ticket owner
    await Notification.create({
      recipient: ticket.user,
      title: "Support Ticket Reply",
      message: `Admin replied to your support ticket: ${ticket.subject}`,
      type: "SUPPORT_TICKET",
    });

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate("user", "name email role")
      .populate("assignedTo", "name email role")
      .populate("participants", "name email role");

    res.status(200).json({
      message: "Reply sent successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("ADMIN REPLY ERROR:", error);

    res.status(500).json({
      message: "Failed to send reply",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN TICKET TO ADMIN OR SELLER
// ======================================================
const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        message: "User to assign is required",
      });
    }

    // Find assigned user
    const assignedUser = await User.findById(assignedTo).select(
      "name email role isBlocked"
    );

    if (!assignedUser) {
      return res.status(404).json({
        message: "Assigned user not found",
      });
    }

    // Blocked user check
    if (assignedUser.isBlocked) {
      return res.status(400).json({
        message: "Cannot assign ticket to a blocked user",
      });
    }

    // Only admin or seller can be assigned
    if (!["admin", "seller"].includes(assignedUser.role)) {
      return res.status(400).json({
        message: "Ticket can only be assigned to admin or seller",
      });
    }

    // Find ticket
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    // ==================================================
    // ASSIGN USER
    // ==================================================
    ticket.assignedTo = assignedUser._id;
    ticket.status = "IN_PROGRESS";

    // ==================================================
    // ADD ASSIGNED USER TO PARTICIPANTS
    // ==================================================

    if (!ticket.participants) {
      ticket.participants = [];
    }

    const alreadyParticipant = ticket.participants.some(
      (participant) =>
        participant.toString() ===
        assignedUser._id.toString()
    );

    if (!alreadyParticipant) {
      ticket.participants.push(assignedUser._id);
    }

    // Also make sure ticket owner is participant
    const ownerAlreadyParticipant = ticket.participants.some(
      (participant) =>
        participant.toString() ===
        ticket.user.toString()
    );

    if (!ownerAlreadyParticipant) {
      ticket.participants.push(ticket.user);
    }

    await ticket.save();

    // ==================================================
    // NOTIFY ASSIGNED USER
    // ==================================================

    await Notification.create({
      recipient: assignedUser._id,
      title: "Support Ticket Assigned",
      message: `A support ticket "${ticket.subject}" has been assigned to you.`,
      type: "SUPPORT_TICKET",
    });

    // ==================================================
    // UPDATED TICKET
    // ==================================================

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate("user", "name email phone role")
      .populate("assignedTo", "name email role")
      .populate("participants", "name email role");

    res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("ASSIGN SUPPORT TICKET ERROR:", error);

    res.status(500).json({
      message: "Failed to assign support ticket",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE TICKET STATUS
// ======================================================
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid ticket status",
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    const previousStatus = ticket.status;

    ticket.status = status;

    await ticket.save();

    // Notify buyer when resolved
    if (
      previousStatus !== "RESOLVED" &&
      status === "RESOLVED"
    ) {
      await Notification.create({
        recipient: ticket.user,
        title: "Support Ticket Resolved",
        message: `Your support ticket "${ticket.subject}" has been resolved.`,
        type: "SUPPORT_TICKET",
      });
    }

    res.status(200).json({
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("UPDATE SUPPORT TICKET STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  assignTicket,
};