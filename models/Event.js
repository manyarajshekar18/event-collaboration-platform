const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    category: {
      type: String,
      enum: [
        "Conference",
        "Wedding",
        "Concert",
        "Workshop",
        "Corporate",
        "Festival",
        "Other",
      ],
      default: "Other",
    },
    budget: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Ongoing", "Completed", "Cancelled"],
      default: "Draft",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
