import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone_no: String,
  address: String,
  electricity_bill_no: String,
  password: String, // store hashed even here
  society_id: String,
  user_id: String,
  home_id: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

const Registration = mongoose.model("PendingRegistration", pendingRegistrationSchema);

export default Registration;
