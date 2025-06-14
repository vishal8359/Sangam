import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
  {
    home_id: { type: String, required: true, unique: true },
    electricity_bill_no: { type: String, required: true, unique: true },
    residents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Home = mongoose.models.home || mongoose.model("Home", homeSchema);

export default Home;
