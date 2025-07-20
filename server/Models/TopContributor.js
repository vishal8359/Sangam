import mongoose from "mongoose";

const topContributorSchema = new mongoose.Schema({
  name: String,
  house: String,
  designation: String,
  achievements: [String],
  avatar: String,
});

const TopContributor = mongoose.model("TopContributor", topContributorSchema);
export default TopContributor;
