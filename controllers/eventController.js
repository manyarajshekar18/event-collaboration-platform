const Event = require("../models/Event");
const Application = require("../models/Application");
const Task = require("../models/Task");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Organizer)
 */
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user._id;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events (with optional filters)
 * @route   GET /api/events
 * @access  Public
 */
exports.getEvents = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("providers", "name email skills");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private (Organizer — owner only)
 */
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Only the organizer who created the event can update it
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    // Prevent mass assignment vulnerabilities
    delete req.body.organizer;
    delete req.body.providers;

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Organizer — owner only)
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await event.deleteOne();

    // Cascading deletions to avoid leaving orphaned records
    await Application.deleteMany({ event: req.params.id });
    await Task.deleteMany({ event: req.params.id });
    await Message.deleteMany({ event: req.params.id });

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get events created by the logged-in organizer
 * @route   GET /api/events/my
 * @access  Private (Organizer)
 */
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark event as Completed
 * @route   PUT /api/events/:id/complete
 * @access  Private (Organizer)
 */
exports.completeEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this event" });
    }

    event.status = "Completed";
    await event.save();

    // Create notifications for all assigned providers
    if (event.providers && event.providers.length > 0) {
      const notifications = event.providers.map(providerId => ({
        user: providerId,
        message: `The event '${event.title}' has been marked as completed! You can now leave a rating.`,
        type: "System",
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};
