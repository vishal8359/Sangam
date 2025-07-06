import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    society_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posted_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
const Notice =
  mongoose.models.Notice || mongoose.model("Notice", noticeSchema);

export default Notice;
