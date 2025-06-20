import mongoose from "mongoose";

const groupJoinRequestSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requested_at: { type: Date, default: Date.now },
    approved_at: Date,
  },
  { timestamps: true }
);

export default mongoose.model("GroupJoinRequest", groupJoinRequestSchema);
