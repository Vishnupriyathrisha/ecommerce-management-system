const express = require("express");
const router = express.Router();

const { generateInvoice } = require("../controllers/invoiceController");

const authMiddleware = require("../middleware/authMiddleware");

// Download Invoice PDF
router.get("/:orderId", authMiddleware, generateInvoice);

module.exports = router;