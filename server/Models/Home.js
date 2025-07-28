import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({

  residents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  street: { type: String, required: true },
  houseNumber: { type: String, required: true },
  houseSortOrder: { type: Number, required: true },
}, {
  timestamps: true
});

export default mongoose.model("Home", homeSchema);
