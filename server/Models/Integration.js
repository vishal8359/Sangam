// backend/Models/SocietyIntegration.js
import mongoose from "mongoose";

const societyIntegrationSchema = new mongoose.Schema(
  {
    society_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      unique: true, 
    },
    adminDetails: {
      name: { type: String, required: true },
      image: { type: String, default: "" }, 
      contact: { type: String, required: true },
      address: { type: String, required: true }, 
    },
    stats: {
      users: { type: Number, default: 0 },
      streets: { type: Number, default: 0 },
      shops: { type: Number, default: 0 },
      animals: {
        dogs: { type: Number, default: 0 },
        cows: { type: Number, default: 0 },
      },
      dailyActivities: { type: String, default: "" },
      populationDensity: { type: Number, default: 0 }, 
      area: { type: Number, default: 0 }, 
      trees: { type: Number, default: 0 },
      cctvs: { type: Number, default: 0 },
      securityGuards: { type: Number, default: 0 },
    },
    mapImage: { type: String, default: "" }, 
  },
  { timestamps: true }
);

const SocietyIntegration =
  mongoose.models.SocietyIntegration ||
  mongoose.model("SocietyIntegration", societyIntegrationSchema);

export default SocietyIntegration;