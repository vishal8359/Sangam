// server/Models/BuzzMessage.js
import mongoose from "mongoose";

const buzzMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audio: {
      type: String,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    // null means public chat; otherwise holds the Group._id
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    fileType: {
      type: String,
    },
    fileUrl: {
      type: String, 
    },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  },

  { timestamps: true }
);

export default mongoose.model("BuzzMessage", buzzMessageSchema);
