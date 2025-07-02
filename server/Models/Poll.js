import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure model name is capitalized
    },
  ],
});

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
      required: true,
    },
    logo: {
      type: String, // base64 or image URL
      default: "",
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (val) => val.length >= 2 && val.length <= 6,
        message: "Poll must have between 2 to 6 options",
      },
    },
    society_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expires_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);
