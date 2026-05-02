const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 1000,
    },
    proposedBudget: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications from the same provider for the same event
applicationSchema.index({ event: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
