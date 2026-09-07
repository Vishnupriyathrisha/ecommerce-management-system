const express = require("express");

const router = express.Router();

const {
  getChatHistory,
} = require(
  "../controllers/chatController"
);

router.get(
  "/history/:roomId",
  getChatHistory
);

module.exports = router;
