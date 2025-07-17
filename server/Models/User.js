import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone_no: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    home_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },

    roles: {
      type: [
        {
          society_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
          },
          role: {
            type: String,
            enum: ["admin", "resident"],
          },
        },
      ],
      default: [],
    },

    joined_societies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Society",
      default: [],
    },

    created_society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    is_approved: { type: Boolean, default: true },
    otp: String,
    otp_expiry: Date,
    is_verified: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
