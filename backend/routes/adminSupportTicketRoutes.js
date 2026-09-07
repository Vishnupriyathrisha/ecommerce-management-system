const express = require("express");

const {
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  assignTicket,
} = require("../controllers/adminSupportTicketController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// All tickets
router.get("/", getAllTickets);

// Single ticket
router.get("/:id", getTicketById);

// Reply
router.put("/:id/reply", replyToTicket);

// Status update
router.put("/:id/status", updateTicketStatus);

router.put("/:id/assign", assignTicket);

module.exports = router;