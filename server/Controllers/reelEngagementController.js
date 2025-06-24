import Reel from "../Models/Reel.js";
import User from "../Models/User.js";

export const getReelEngagement = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total Reels by user
    const userReels = await Reel.find({ user: userId });

    const totalReels = userReels.length;
    const totalViews = userReels.reduce((sum, reel) => sum + (reel.views || 0), 0);

    // Total followers
    const user = await User.findById(userId).select("followers");
    const totalFollowers = user.followers?.length || 0;

    res.json({
      totalReels,
      totalViews,
      totalFollowers,
    });
  } catch (error) {
    console.error("Error getting reel engagement:", error);
    res.status(500).json({ message: "Server error" });
  }
};
