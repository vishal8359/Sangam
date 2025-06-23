import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: String,
  description: String,
  society_id: { type: mongoose.Schema.Types.ObjectId, ref: "Society" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("GalleryImage", imageSchema);
