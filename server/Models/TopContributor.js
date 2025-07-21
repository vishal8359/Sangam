import mongoose from "mongoose";

const topContributorSchema = new mongoose.Schema({
  name: String,
  house: String,
  designation: String,
  achievements: [String],
  society_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society",
    required: true,
  },
  avatar: String,
});

const TopContributor = mongoose.model("TopContributor", topContributorSchema);
export default TopContributor;
