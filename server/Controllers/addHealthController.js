// controllers/userController.js

import Health from "../Models/Health.js";
import User from "../Models/User.js";

export const addHealth = async (req, res) => {
  try {
    const userId = req.user._id; // Auth middleware must set req.user
    const {
      name,
      age,
      feet,
      inches,
      weight,
      fat,
      condition,
      bmi,
      healthScore,
    } = req.body;

    // Check if health already exists
    let health = await Health.findOne({ user: userId });

    if (health) {
      // Update existing
      health.set({
        name,
        age,
        feet,
        inches,
        weight,
        fat,
        condition,
        bmi,
        healthScore,
      });
    } else {
      // Create new
      health = new Health({
        user: userId,
        name,
        age,
        feet,
        inches,
        weight,
        fat,
        condition,
        bmi,
        healthScore,
      });
    }

    await health.save();
    return res.status(200).json({ success: true, data: health });
  } catch (error) {
    console.error("Error in addHealth:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getHealth = async (req, res) => {
  try {
    const userId = req.user._id;

    const health = await Health.findOne({ user: userId });
    if (!health) {
      return res.status(404).json({ success: false, error: "Health data not found" });
    }

    res.status(200).json({ success: true, data: health });
  } catch (error) {
    console.error("Error in getHealth:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
