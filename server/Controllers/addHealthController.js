import Health from "../Models/Health.js"; // Make sure you have this model
import Home from "../Models/Home.js";
import User from "../Models/User.js";
import mongoose from "mongoose";

// GET /api/users/gethealth
export const getHealth = async (req, res) => {
  try {
    const userId = req.user._id;
    const societyId = req.user.societyId;
    if (!societyId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a society." });
    }
    const healthData = await Health.find({ society: societyId }).sort({
      createdAt: -1,
    });

    res.status(200).json(healthData);
  } catch (err) {
    console.error("Error in getHealth:", err.message);
    res.status(500).json({ message: "Server error during getHealth." });
  }
};

// POST /api/users/addhealth
export const addHealth = async (req, res) => {
  try {
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
      house,
    } = req.body;

    const userId = req.user._id;
    const societyId = req.user.societyId;
    if (
      !name ||
      !age ||
      !feet ||
      !inches ||
      !weight ||
      !fat ||
      !condition ||
      !bmi ||
      !healthScore ||
      !house ||
      !societyId
    ) {
      return res.status(400).json({
        message: "All fields are required, including society information.",
      });
    }

    const healthEntry = new Health({
      user: userId,
      society: societyId,
      name,
      age,
      feet,
      inches,
      weight,
      fat,
      condition,
      bmi,
      healthScore,
      house,
    });

    await healthEntry.save();
    res.status(201).json(healthEntry);
  } catch (err) {
    console.error("Error in addHealth:", err.message);
    res.status(500).json({ message: "Server error during addHealth." });
  }
};

export const deleteHealthData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const societyId = req.user.societyId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Health data ID." });
    }

    const healthEntry = await Health.findOne({
      _id: id,
      user: userId,
      society: societyId,
    }); 

    if (!healthEntry) {
      return res.status(404).json({
        success: false,
        message:
          "Health data not found or you don't have permission to delete it.",
      });
    }

    await Health.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Health data deleted successfully." });
  } catch (error) {
    console.error("Error deleting health data:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during deletion." });
  }
};
