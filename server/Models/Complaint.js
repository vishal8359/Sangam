// server/Models/Complaint.js
import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adminName: { type: String, required: true }, // To store admin's name directly
  createdAt: { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    house_no: { type: String, required: true },
    complaint_type: {
      type: String,
      enum: [
        "Water Leakage",
        "Electricity Issue",
        "Noise Complaint",
        "Security Concern",
        "Other",
      ],
      required: true,
    },
    description: { type: String, required: true },
    file_url: { type: String },
    file_id: { type: String },
    society_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
    replies: [replySchema], // Added: Array to store replies
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);