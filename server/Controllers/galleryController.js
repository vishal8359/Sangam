// POST /api/users/gallery/reels/upload
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import Reel from "../Models/Reel.js";
import User from "../Models/User.js";
import mongoose from "mongoose";

export const uploadReel = async (req, res) => {
  try {
    const { description, tags } = req.body;
    const file = req.file;
    const userId = req.user._id;

    // console.log("🧠 User in request:", req.user);

    if (!file) return res.status(400).json({ message: "Video file required" });

    const { url, public_id } = await uploadToCloudinary(
      file.buffer,
      "reels",
      file.mimetype
    );

    const reel = new Reel({
      user: userId,
      videoUrl: url,
      description,
      tags: tags ? tags.split(",") : [],
    });

    await reel.save();

    res.status(201).json({ message: "Reel uploaded", reel });
  } catch (error) {
    console.error("❌ Upload Reel Error:", error);
    res.status(500).json({ message: "Failed to upload reel" });
  }
};

export const getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("user", "user_name user_img") // only select basic user info
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(reels);
  } catch (error) {
    console.error("❌ Failed to fetch all reels:", error);
    res.status(500).json({ message: "Failed to fetch reels" });
  }
};

// PUT /api/users/gallery/reels/:reelId/like
export const likeReel = async (req, res) => {
  const userId = req.user._id?.toString();
  const { reelId } = req.params;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const index = reel.likes.findIndex(
      (id) => id && id.toString() === userObjectId.toString()
    );

    if (index === -1) {
      reel.likes.push(userObjectId); // like
    } else {
      reel.likes.splice(index, 1); // unlike
    }

    await reel.save();
    res.status(200).json({
      liked: index === -1,
      likesCount: reel.likes.length,
    });
  } catch (error) {
    console.error("❌ Like reel failed:", error);
    res.status(500).json({ message: "Failed to like reel" });
  }
};

// POST /api/users/gallery/reels/:reelId/comment
export const addComment = async (req, res) => {
  const { text } = req.body;
  const { reelId } = req.params;
  const userId = req.user.userId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    reel.comments.push({ user: userId, text });
    await reel.save();

    res.status(200).json({ message: "Comment added", comments: reel.comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// POST /api/users/gallery/reels/:reelId/comment/:commentIndex/reply
export const addReply = async (req, res) => {
  const { reelId, commentIndex } = req.params;
  const { text } = req.body;
  const userId = req.user.userId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel || !reel.comments[commentIndex])
      return res.status(404).json({ message: "Comment not found" });

    reel.comments[commentIndex].replies.push({ user: userId, text });
    await reel.save();

    res.status(200).json({ message: "Reply added", comments: reel.comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to add reply" });
  }
};

// PUT /api/users/gallery/reels/:reelId/view
export const incrementView = async (req, res) => {
  const { reelId } = req.params;
  const userId = req.user?._id;

  try {
    const reel = await Reel.findById(reelId);

    if (!reel) return res.status(404).json({ message: "Reel not found" });

    if (!reel.viewedBy.includes(userId)) {
      reel.views += 1;
      reel.viewedBy.push(userId);
      await reel.save();
    }

    res.status(200).json({ message: "View counted" });
  } catch (err) {
    console.error("View count error:", err);
    res.status(500).json({ message: "Failed to count view" });
  }
};

// GET /api/users/gallery/reels/engagement
export const getEngagementStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const reels = await Reel.find({ user: userId });

    const uploads = reels.length;
    const totalViews = reels.reduce((acc, r) => acc + r.views, 0);
    const totalLikes = reels.reduce((acc, r) => acc + r.likes.length, 0);
    const totalComments = reels.reduce((acc, r) => acc + r.comments.length, 0);
    const earnings = totalViews * 0.1; // For example, ₹0.1 per view

    res
      .status(200)
      .json({ uploads, totalViews, totalLikes, totalComments, earnings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const getUserReelStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const user = await User.findById(userId).populate("followers");

    if (!user) return res.status(404).json({ message: "User not found" });

    const reels = await Reel.find({ user: userId }); // Now this will match

    const totalViews = reels.reduce((acc, reel) => acc + reel.views, 0);
    const uploads = reels.length;
    const followers = user.followers.length;
    const reach = Math.min(100, Math.floor((totalViews / 1000) * 10));

    res.json({
      uploads,
      totalViews,
      followers,
      reach,
      earnings: uploads * 100, // Sample: ₹100 per reel
    });
  } catch (err) {
    console.error("Failed to fetch reel stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const getReelsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const reels = await Reel.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(reels);
  } catch (error) {
    console.error("❌ Error fetching user reels:", error);
    res.status(500).json({ message: "Failed to fetch reels" });
  }
};

export const deleteReelById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);

    if (!reel) return res.status(404).json({ message: "Reel not found" });

    // Optional: restrict deletion to owner
    if (String(reel.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await reel.deleteOne();

    res.status(200).json({ message: "Reel deleted" });
  } catch (error) {
    console.error("❌ Error deleting reel:", error);
    res.status(500).json({ message: "Failed to delete reel" });
  }
};
