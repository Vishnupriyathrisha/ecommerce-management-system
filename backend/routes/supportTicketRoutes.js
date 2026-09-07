const express = require("express");

const {
  createTicket,
  getMyTickets,
  getMyTicketById,
  getTicketMessages,
  sendTicketMessage,
  markMessagesAsRead,
} = require("../controllers/supportTicketController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTicket);

router.get("/my-tickets", getMyTickets);

router.get("/:id/messages", getTicketMessages);

router.post("/:id/messages", sendTicketMessage);

router.put("/:id/messages/read", markMessagesAsRead);

router.get("/:id", getMyTicketById);

module.exports = router;