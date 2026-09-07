const express = require("express");
const router = express.Router();

const {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

const authMiddleware = require("../middleware/authMiddleware");

// Add address
router.post("/", authMiddleware, addAddress);

// Get my addresses
router.get("/", authMiddleware, getMyAddresses);

// Update address
router.put("/:id", authMiddleware, updateAddress);

// Delete address
router.delete("/:id", authMiddleware, deleteAddress);

// Set default address
router.patch("/:id/default", authMiddleware, setDefaultAddress);

module.exports = router;