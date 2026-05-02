const Review = require("../models/Review");
const Event = require("../models/Event");
const Notification = require("../models/Notification");

exports.createReview = async (req, res) => {
  try {
    const { eventId, revieweeId, rating, comment } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Assuming event holds .providers (accepted ids) and .organizer (owner)
    // Only accepted providers or the organizer can review each other.
    
    const isOrganizer = event.organizer.toString() === req.user.id;
    const isProvider = event.providers?.some(p => p.toString() === req.user.id);
    
    if (!isOrganizer && !isProvider) {
       return res.status(403).json({ success: false, message: "You were not part of this event" });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ event: eventId, reviewer: req.user.id, reviewee: revieweeId });
    if (existing) {
       return res.status(400).json({ success: false, message: "You have already reviewed this user for this event" });
    }

    const review = await Review.create({
      event: eventId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating,
      comment
    });

    // Notify the reviewee
    await Notification.create({
      user: revieweeId,
      message: `You received a ${rating}-star review for the event '${event.title}'.`,
      type: "Review"
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).populate("reviewer", "name").sort("-createdAt");
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
