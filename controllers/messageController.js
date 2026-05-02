const Message = require("../models/Message");
const Event = require("../models/Event");

// ✅ Send message
exports.sendMessage = async (req, res, next) => {
  try {
    const { eventId, content } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const message = await Message.create({
      event: eventId,
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    });

    await message.populate("sender", "name email role");

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// ✅ Get messages for event
exports.getEventMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      event: req.params.eventId,
    })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};