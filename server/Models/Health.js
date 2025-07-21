import mongoose from "mongoose";
import User from "./User.js";

const healthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society", 
    required: true,
  },
  name: String,
  age: Number,
  feet: Number,
  inches: Number,
  weight: Number,
  fat: Number,
  condition: String,
  house: String,
  bmi: Number,
  healthScore: Number,
});

healthSchema.pre("save", async function (next) {
  if (this.isModified("user") || !this.house) {
    const user = await User.findById(this.user);
    console.log("Fetched user:", user);

    if (user?.address) {
      const houseNo = user.address.split(",")[0]?.trim();
      console.log("Extracted house number:", houseNo);
      this.house = houseNo;
    } else {
      console.log("No address found for user.");
    }
  }
  next();
});

const Health = mongoose.models.Health || mongoose.model("Health", healthSchema);
export default Health;
