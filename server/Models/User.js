import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_no: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  home_id: { type: String, required: true },
  role: { type: String, enum: ["resident", "admin"], default: "resident" },
  is_approved: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User
