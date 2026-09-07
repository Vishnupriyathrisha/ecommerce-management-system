const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const { getIO } = require("../config/socket");

// ======================================================
// CREATE SUPPORT TICKET
// ======================================================
const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Subject and message are required",
      });
    }

    // Find an available admin
    const admin = await User.findOne({
      role: "admin",
      isBlocked: { $ne: true },
    }).select("_id");

    // Buyer + initial admin become participants
    const participants = [req.user._id];

    if (admin) {
      participants.push(admin._id);
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject: subject.trim(),
      message: message.trim(),
      assignedTo: admin ? admin._id : null,
      participants,
    });

    // Notify all admins
    const admins = await User.find({
      role: "admin",
      isBlocked: { $ne: true },
    }).select("_id");

    if (admins.length > 0) {
      const notifications = admins.map((adminUser) => ({
        recipient: adminUser._id,
        title: "New Support Ticket",
        message: `A new support ticket has been created: ${subject.trim()}`,
        type: "SUPPORT_TICKET",
      }));

      await Notification.insertMany(notifications);
    }

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate("user", "name email role")
      .populate("assignedTo", "name email role")
      .populate("participants", "name email role");

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    console.error("CREATE SUPPORT TICKET ERROR:", error);

    res.status(500).json({
      message: "Failed to create support ticket",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY TICKETS
// ======================================================
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      $or: [
        { user: req.user._id },
        { assignedTo: req.user._id },
        { participants: req.user._id },
      ],
    })
      .populate("user", "name email role")
      .populate("assignedTo", "name email role")
      .populate("participants", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("GET MY TICKETS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
};

// ======================================================
// CHECK TICKET PARTICIPANT
// ======================================================
const getAuthorizedTicket = async (ticketId, user) => {
  const ticket = await SupportTicket.findById(ticketId)
    .populate("user", "name email role")
    .populate("assignedTo", "name email role")
    .populate("participants", "name email role");

  if (!ticket) {
    return null;
  }

  const currentUserId = user._id.toString();

  const ownerId = ticket.user?._id?.toString();
  const assignedId = ticket.assignedTo?._id?.toString();

  const isOwner = ownerId === currentUserId;
  const isAssigned = assignedId === currentUserId;

  // Check participants array
  const isParticipant = ticket.participants?.some(
    (participant) =>
      participant?._id?.toString() === currentUserId
  );

  // Any admin can access
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssigned && !isParticipant && !isAdmin) {
    return false;
  }

  return ticket;
};

// ======================================================
// GET SINGLE TICKET
// ======================================================
const getMyTicketById = async (req, res) => {
  try {
    const ticket = await getAuthorizedTicket(
      req.params.id,
      req.user
    );

    if (ticket === null) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    if (ticket === false) {
      return res.status(403).json({
        message: "You are not authorized to access this ticket",
      });
    }

    res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error("GET SUPPORT TICKET ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch support ticket",
      error: error.message,
    });
  }
};

// ======================================================
// GET CHAT MESSAGES
// ======================================================
const getTicketMessages = async (req, res) => {
  try {
    const ticket = await getAuthorizedTicket(
      req.params.id,
      req.user
    );

    if (ticket === null) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    if (ticket === false) {
      return res.status(403).json({
        message: "You are not authorized to view these messages",
      });
    }

    const messages = await ChatMessage.find({
      ticket: req.params.id,
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("GET CHAT MESSAGES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch chat messages",
      error: error.message,
    });
  }
};

// ======================================================
// SEND CHAT MESSAGE
// ======================================================
const sendTicketMessage = async (req, res) => {
  try {
    const { message, receiverId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const ticket = await getAuthorizedTicket(
      req.params.id,
      req.user
    );

    if (ticket === null) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    if (ticket === false) {
      return res.status(403).json({
        message:
          "You are not authorized to send messages in this ticket",
      });
    }

    const currentUserId = req.user._id.toString();

    // ==================================================
    // GET ALL PARTICIPANT IDS
    // ==================================================
    const participantIds = (ticket.participants || [])
      .map((participant) => participant?._id?.toString())
      .filter(Boolean);

    const ownerId = ticket.user?._id?.toString();
    const assignedId = ticket.assignedTo?._id?.toString();

    // Make sure owner and assigned user are also included
    if (ownerId && !participantIds.includes(ownerId)) {
      participantIds.push(ownerId);
    }

    if (assignedId && !participantIds.includes(assignedId)) {
      participantIds.push(assignedId);
    }

    let receiver = null;

    // ==================================================
    // EXPLICIT RECEIVER
    // ==================================================
    if (receiverId) {
      const requestedReceiverId = receiverId.toString();

      // Receiver must be a participant
      if (!participantIds.includes(requestedReceiverId)) {
        return res.status(403).json({
          message: "Invalid receiver for this ticket",
        });
      }

      receiver = requestedReceiverId;
    }

    // ==================================================
    // AUTOMATIC RECEIVER
    // ==================================================
    else {
      // ----------------------------------------------
      // BUYER -> ASSIGNED ADMIN / SELLER
      // ----------------------------------------------
      if (currentUserId === ownerId) {
        receiver = assignedId;

        // If no assigned user, choose another participant
        if (!receiver) {
          receiver =
            participantIds.find(
              (id) => id !== currentUserId
            ) || null;
        }
      }

      // ----------------------------------------------
      // ASSIGNED USER -> BUYER
      // ----------------------------------------------
      else if (currentUserId === assignedId) {
        receiver = ownerId;
      }

      // ----------------------------------------------
      // ADMIN -> SELLER / BUYER
      // ----------------------------------------------
      else if (req.user.role === "admin") {
        // Prefer assigned seller/admin
        if (
          assignedId &&
          assignedId !== currentUserId
        ) {
          receiver = assignedId;
        } else {
          receiver =
            participantIds.find(
              (id) => id !== currentUserId
            ) || null;
        }
      }

      // ----------------------------------------------
      // SELLER -> BUYER / ADMIN
      // ----------------------------------------------
      else if (req.user.role === "seller") {
        // Prefer buyer
        if (
          ownerId &&
          ownerId !== currentUserId
        ) {
          receiver = ownerId;
        } else {
          receiver =
            participantIds.find(
              (id) => id !== currentUserId
            ) || null;
        }
      }
    }

    // ==================================================
    // NO RECEIVER
    // ==================================================
    if (!receiver) {
      return res.status(400).json({
        message:
          "No support participant is available for this ticket",
      });
    }

    // ==================================================
    // PREVENT SELF MESSAGE
    // ==================================================
    if (receiver === currentUserId) {
      return res.status(400).json({
        message: "You cannot send a message to yourself",
      });
    }

    // ==================================================
    // VERIFY RECEIVER IS PARTICIPANT
    // ==================================================
    if (!participantIds.includes(receiver)) {
      return res.status(403).json({
        message: "Receiver is not a participant in this ticket",
      });
    }

    // ==================================================
    // VERIFY RECEIVER EXISTS
    // ==================================================
    const receiverUser = await User.findById(receiver).select(
      "name email role isBlocked"
    );

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    if (receiverUser.isBlocked) {
      return res.status(400).json({
        message: "Cannot send message to a blocked user",
      });
    }

    // ==================================================
    // CREATE CHAT MESSAGE
    // ==================================================
    const chatMessage = await ChatMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      receiver: receiver,
      message: message.trim(),
      isRead: false,
    });

    // ==================================================
    // POPULATE MESSAGE
    // ==================================================
    const populatedMessage = await ChatMessage.findById(
      chatMessage._id
    )
      .populate("sender", "name email role")
      .populate("receiver", "name email role");

    // ==================================================
    // SOCKET
    // ==================================================
    const io = getIO();

    io.to(`ticket_${ticket._id}`).emit(
      "new_message",
      populatedMessage
    );

    // ==================================================
    // NOTIFICATION
    // ==================================================
    await Notification.create({
      recipient: receiver,
      title: "New Support Message",
      message: `${req.user.name} sent you a new support message`,
      type: "GENERAL",
    });

    // ==================================================
    // REAL-TIME NOTIFICATION
    // ==================================================
    io.to(`user_${receiver}`).emit(
      "new_notification",
      {
        title: "New Support Message",
        message: `${req.user.name} sent you a new support message`,
        type: "GENERAL",
        ticketId: ticket._id,
      }
    );

    // ==================================================
    // UPDATE STATUS
    // ==================================================
    if (ticket.status === "OPEN") {
      ticket.status = "IN_PROGRESS";
      await ticket.save();
    }

    // ==================================================
    // RESPONSE
    // ==================================================
    res.status(201).json({
      message: "Message sent successfully",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    console.error("SEND SUPPORT MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// ======================================================
// MARK MESSAGES AS READ
// ======================================================
const markMessagesAsRead = async (req, res) => {
  try {
    const ticket = await getAuthorizedTicket(
      req.params.id,
      req.user
    );

    if (ticket === null) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    if (ticket === false) {
      return res.status(403).json({
        message: "You are not authorized to access this ticket",
      });
    }

    // Find unread messages received by current user
    const unreadMessages = await ChatMessage.find({
      ticket: req.params.id,
      receiver: req.user._id,
      isRead: false,
    }).select("_id");

    if (unreadMessages.length === 0) {
      return res.status(200).json({
        message: "No unread messages",
        messageIds: [],
      });
    }

    const messageIds = unreadMessages.map(
      (msg) => msg._id
    );

    await ChatMessage.updateMany(
      {
        _id: { $in: messageIds },
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    // ==================================================
    // SOCKET READ EVENT
    // ==================================================
    const io = getIO();

    io.to(`ticket_${ticket._id}`).emit(
      "messages_read",
      {
        ticketId: ticket._id,
        messageIds,
        readBy: req.user._id,
      }
    );

    res.status(200).json({
      message: "Messages marked as read",
      messageIds,
    });
  } catch (error) {
    console.error("MARK MESSAGES READ ERROR:", error);

    res.status(500).json({
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  createTicket,
  getMyTickets,
  getMyTicketById,
  getTicketMessages,
  sendTicketMessage,
  markMessagesAsRead,
};