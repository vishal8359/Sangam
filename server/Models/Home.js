// models/Home.js
import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  electricity_bill_no: { type: String, required: true, unique: true },
  residents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Home", homeSchema);
