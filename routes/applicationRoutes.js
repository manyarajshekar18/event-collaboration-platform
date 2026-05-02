const express = require("express");
const { body } = require("express-validator");
const {
  applyToEvent,
  getEventApplications,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// Provider applies to an event
router.post(
  "/",
  protect,
  authorize("Provider"),
  [body("eventId").notEmpty().withMessage("Event ID is required")],
  validate,
  applyToEvent
);

// Provider views own applications
router.get("/my", protect, authorize("Provider"), getMyApplications);

// Organizer views applications for their event
router.get(
  "/event/:eventId",
  protect,
  authorize("Organizer"),
  getEventApplications
);

// Organizer accepts / rejects an application
router.put(
  "/:id",
  protect,
  authorize("Organizer"),
  [
    body("status")
      .isIn(["Accepted", "Rejected"])
      .withMessage("Status must be Accepted or Rejected"),
  ],
  validate,
  updateApplicationStatus
);

module.exports = router;
