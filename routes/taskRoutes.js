const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getEventTasks,
  getMyTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// Create a task (Organizer only)
router.post(
  "/",
  protect,
  authorize("Organizer"),
  [
    body("eventId").notEmpty().withMessage("Event ID is required"),
    body("title").notEmpty().withMessage("Task title is required"),
  ],
  validate,
  createTask
);

// Get all tasks for an event
router.get("/event/:eventId", protect, getEventTasks);

// Get tasks assigned to logged-in user
router.get("/my", protect, getMyTasks);

// Update a task (Organizer or Assignee)
router.put("/:id", protect, updateTask);

// Delete a task (Organizer only)
router.delete("/:id", protect, authorize("Organizer"), deleteTask);

module.exports = router;
