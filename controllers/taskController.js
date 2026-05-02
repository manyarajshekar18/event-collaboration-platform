const Task = require("../models/Task");
const Event = require("../models/Event");
const Notification = require("../models/Notification");

/**
 * @desc    Create a task for an event
 * @route   POST /api/tasks
 * @access  Private (Organizer)
 */
exports.createTask = async (req, res, next) => {
  try {
    const { eventId, title, description, assignedTo, priority, dueDate } =
      req.body;

    // Verify event exists and belongs to the organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the event organizer can create tasks",
      });
    }

    const task = await Task.create({
      event: eventId,
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      dueDate,
    });

    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        message: `You have been assigned a new ${priority} priority task: '${title}' for the event '${event.title}'.`,
        type: "Task"
      });
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks for an event
 * @route   GET /api/tasks/event/:eventId
 * @access  Private
 */
exports.getEventTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ event: req.params.eventId })
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ priority: -1, dueDate: 1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks assigned to the logged-in user
 * @route   GET /api/tasks/my
 * @access  Private
 */
exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("event", "title date")
      .populate("assignedBy", "name")
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (status, details)
 * @route   PUT /api/tasks/:id
 * @access  Private (Organizer of the event OR assignee)
 */
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Allow update if user is the event organizer or the assigned provider
    const event = await Event.findById(task.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }
    const isOrganizer =
      event.organizer.toString() === req.user._id.toString();
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isOrganizer && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Assignees can only update status
    if (isAssignee && !isOrganizer) {
      const allowed = { status: req.body.status };
      task = await Task.findByIdAndUpdate(req.params.id, allowed, {
        new: true,
        runValidators: true,
      });
    } else {
      // Organizer can update any field except moving to another event or spoofing assigner
      delete req.body.event;
      delete req.body.assignedBy;

      task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Organizer of the event)
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const event = await Event.findById(task.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the event organizer can delete tasks",
      });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};
