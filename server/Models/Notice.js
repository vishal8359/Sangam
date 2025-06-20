import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }, 
    society_id: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
    posted_at: { type: Date, default: Date.now }, // explicitly included
  },
  { timestamps: true }
);

export default mongoose.model("Notice", noticeSchema);
