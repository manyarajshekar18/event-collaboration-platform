const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, /* Useful for frontend redirection */
    type: { type: String, enum: ["Application", "Task", "Event", "Review", "System"], default: "System" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
