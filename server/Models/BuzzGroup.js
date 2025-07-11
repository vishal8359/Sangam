// server/Models/BuzzGroup.js
import mongoose from "mongoose";

// models/BuzzGroup.js (or similar)

const buzzGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society",
    required: true,
  },
});


const BuzzGroup = mongoose.model("BuzzGroup", buzzGroupSchema);
export default BuzzGroup;
