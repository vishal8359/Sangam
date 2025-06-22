import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    organiserName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    place: { type: String, required: true },
    image: { type: String },
    isNeighbourEvent: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cancelled: { type: Boolean, default: false },

    rsvps: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["going", "interested", "not_going"],
          required: true,
        },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isRecurring: { type: Boolean, default: false },
    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: null,
    },

    type: {
      type: String,
      enum: ["cultural", "sports", "education", "health", "other"],
      default: "other",
    },
    capacity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
