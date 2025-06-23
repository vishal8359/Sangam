import mongoose from "mongoose";

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Replace String location with GeoJSON Polygon
    location: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // Array of array of [lng, lat]
        required: true,
      },
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    residents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Enable geospatial queries
societySchema.index({ location: "2dsphere" });

export default mongoose.model("Society", societySchema);
