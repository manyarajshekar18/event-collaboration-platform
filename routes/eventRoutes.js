const express = require("express");
const { body } = require("express-validator");
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  completeEvent,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// Private — Get logged-in organizer's events
router.get("/my", protect, authorize("Organizer"), getMyEvents);

// Public
router.get("/", getEvents);
router.get("/:id", getEvent);

// Private — Organizer only
router.post(
  "/",
  protect,
  authorize("Organizer"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  validate,
  createEvent
);

router.put("/:id", protect, authorize("Organizer"), updateEvent);
router.put("/:id/complete", protect, authorize("Organizer"), completeEvent);
router.delete("/:id", protect, authorize("Organizer"), deleteEvent);

module.exports = router;
