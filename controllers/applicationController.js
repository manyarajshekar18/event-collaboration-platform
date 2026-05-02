const Application = require("../models/Application");
const Event = require("../models/Event");
const Notification = require("../models/Notification");

/**
 * @desc    Provider applies to an event
 * @route   POST /api/applications
 * @access  Private (Provider)
 */
exports.applyToEvent = async (req, res, next) => {
  try {
    const { eventId, message, proposedBudget } = req.body;

    // Verify event exists and is published
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    if (event.status !== "Published") {
      return res.status(400).json({
        success: false,
        message: "Can only apply to published events",
      });
    }

    const application = await Application.create({
      event: eventId,
      provider: req.user._id,
      message,
      proposedBudget,
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for a specific event (Organizer view)
 * @route   GET /api/applications/event/:eventId
 * @access  Private (Organizer — event owner)
 */
exports.getEventApplications = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications for this event",
      });
    }

    const applications = await Application.find({
      event: req.params.eventId,
    }).populate("provider", "name email skills phone bio");

    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applications submitted by the logged-in provider
 * @route   GET /api/applications/my
 * @access  Private (Provider)
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      provider: req.user._id,
    }).populate("event", "title date location status");

    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (accept / reject)
 * @route   PUT /api/applications/:id
 * @access  Private (Organizer — event owner)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // "Accepted" or "Rejected"

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Accepted' or 'Rejected'",
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const event = await Event.findById(application.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    await application.save();

    // If accepted, add the provider to the event's providers list
    if (status === "Accepted") {
      await Event.findByIdAndUpdate(application.event, {
        $addToSet: { providers: application.provider },
      });
      await Notification.create({
        user: application.provider,
        message: `Your application for the event '${event.title}' was Accepted! You are now part of the team.`,
        type: "Application"
      });
    } else if (status === "Rejected") {
      // If rejected, ensure the provider is removed from the event's providers list
      await Event.findByIdAndUpdate(application.event, {
        $pull: { providers: application.provider },
      });
      await Notification.create({
        user: application.provider,
        message: `Your application for the event '${event.title}' was Rejected.`,
        type: "Application"
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
