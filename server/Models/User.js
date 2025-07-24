import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_no: { type: String, required: true, unique: true },
    address: { type: String }, // Existing general address string field
    password: { type: String, required: true },
    home_id: { type: mongoose.Schema.Types.ObjectId, ref: "Home" },
    isOnline: { type: Boolean, default: false },
    roles: [
      {
        society_id: { type: mongoose.Schema.Types.ObjectId, ref: "Society" },
        role: { type: String, enum: ["resident", "admin"], default: "resident" },
        _id: false,
      },
    ],
    joined_societies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Society" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    servicesOffered: [{ type: String }],
    is_approved: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    otp: String,
    otp_expiry: Date,
    lastSeen: { type: Date, default: Date.now },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/dxgshlglc/image/upload/v1753210282/avatars/qoqvmgirhleyfwhsutpm.jpg",
    },
    // Reference to DeliveryAddress documents
    delivery_addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "DeliveryAddress" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
