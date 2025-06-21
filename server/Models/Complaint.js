import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    house_no: { type: String, required: true },
    complaint_type: { type: String, enum: ["Water Leakage", "Electricity", "Noise", "Others"], required: true },
    description: { type: String, required: true },
    file_url: { type: String },
    file_id: { type: String }, // For Cloudinary deletion if needed
    society_id: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
  },
  { timestamps: true }
);


export default mongoose.model("Complaint", complaintSchema);
