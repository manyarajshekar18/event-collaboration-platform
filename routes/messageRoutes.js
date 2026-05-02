const express = require("express");
const { body } = require("express-validator");
const {
  sendMessage,
  getEventMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// send message
router.post(
  "/",
  protect,
  [
    body("eventId").notEmpty(),
    body("content").notEmpty(),
  ],
  validate,
  sendMessage
);

// get messages
router.get("/event/:eventId", protect, getEventMessages);

module.exports = router;