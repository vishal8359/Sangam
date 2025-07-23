import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import Reel from "../Models/Reel.js";
import User from "../Models/User.js";
import mongoose from "mongoose";
import BuzzGroup from "../Models/BuzzGroup.js";
import Message from "../Models/Chats.js";
import BuzzMessage from "../Models/BuzzMessage.js";

export const uploadReel = async (req, res) => {
  try {
    const { description, tags } = req.body;
    const file = req.file;
    const userId = req.user._id;

    if (!file) return res.status(400).json({ message: "Video file required" });

    const { secure_url, public_id } = await uploadToCloudinary(
      file.buffer,
      "reels",
      file.mimetype
    );

    const reel = new Reel({
      user: userId,
      videoUrl: secure_url,
      description,
      tags: tags ? tags.split(",") : [],
    });

    await reel.save();

    res.status(201).json({ message: "Reel uploaded", reel });
  } catch (error) {
    console.error("Upload Reel Error:", error);
    res.status(500).json({ message: "Failed to upload reel" });
  }
};

export const getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("user", "name avatar followers")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(reels);
  } catch (error) {
    console.error("Failed to fetch all reels:", error);
    res.status(500).json({ message: "Failed to fetch reels" });
  }
};

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
      reel.likes.push(userObjectId);
    } else {
      reel.likes.splice(index, 1);
    }

    await reel.save();
    res.status(200).json({
      liked: index === -1,
      likesCount: reel.likes.length,
    });
  } catch (error) {
    console.error("Like reel failed:", error);
    res.status(500).json({ message: "Failed to like reel" });
  }
};

export const addComment = async (req, res) => {
  const { text } = req.body;
  const { reelId } = req.params;
  const userId = req.user._id;

  try {
    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    reel.comments.push({
      user: userId,
      text,
      replies: [],
    });

    const savedReel = await reel.save();

    const populatedReel = await Reel.findById(savedReel._id)
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar");

    res.status(200).json({
      message: "Comment added",
      comments: populatedReel.comments,
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const addReply = async (req, res) => {
  const { reelId, commentIndex } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel || !reel.comments[commentIndex])
      return res.status(404).json({ message: "Comment not found" });

    reel.comments[commentIndex].replies.push({ user: userId, text });
    await reel.save();

    const populatedReel = await Reel.findById(reelId)
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar");

    res
      .status(200)
      .json({ message: "Reply added", comments: populatedReel.comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to add reply" });
  }
};

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

export const getEngagementStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const reels = await Reel.find({ user: userId });

    const uploads = reels.length;
    const totalViews = reels.reduce((acc, r) => acc + r.views, 0);
    const totalLikes = reels.reduce((acc, r) => acc + r.likes.length, 0);
    const totalComments = reels.reduce((acc, r) => acc + r.comments.length, 0);
    const earnings = totalViews * 0.1;

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

    const reels = await Reel.find({ user: userId });

    const totalViews = reels.reduce((acc, reel) => acc + reel.views, 0);
    const uploads = reels.length;
    const followers = user.followers.length;
    const reach = Math.min(100, Math.floor((totalViews / 1000) * 10));

    res.json({
      uploads,
      totalViews,
      followers,
      reach,
      earnings: uploads * 100,
    });
  } catch (err) {
    console.error("Failed to fetch reel stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const getReelsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const reels = await Reel.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(reels);
  } catch (error) {
    console.error("Error fetching user reels:", error);
    res.status(500).json({ message: "Failed to fetch reels" });
  }
};

export const deleteReelById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);

    if (!reel) return res.status(404).json({ message: "Reel not found" });

    if (String(reel.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await reel.deleteOne();

    res.status(200).json({ message: "Reel deleted" });
  } catch (error) {
    console.error("Error deleting reel:", error);
    res.status(500).json({ message: "Failed to delete reel" });
  }
};

export const toggleFollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      user.following.pull(targetId);
      targetUser.followers.pull(userId);
    } else {
      user.following.push(targetId);
      targetUser.followers.push(userId);
    }

    await user.save();
    await targetUser.save();

    res.status(200).json({ following: !isFollowing });
  } catch (error) {
    console.error("Follow toggle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const shareReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { targetUserIds = [], buzzGroupIds = [] } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    for (const userId of targetUserIds) {
      console.log(`Reel shared with user: ${userId}`);
    }

    for (const groupId of buzzGroupIds) {
      await BuzzGroup.findByIdAndUpdate(groupId, {
        $push: {
          posts: {
            user: req.user._id,
            content: reel.description,
            file: reel.videoUrl, // Corrected to videoUrl
            createdAt: new Date(),
          },
        },
      });
      console.log(`Reel pushed to group: ${groupId}`);
    }

    res
      .status(200)
      .json({ success: true, message: "Reel shared successfully" });
  } catch (err) {
    console.error("Error sharing reel:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendReelToChatOrGroup = async (req, res) => {
  try {
    const { senderId, receiverId, groupId, reelUrl, societyId } = req.body;

    if (!senderId || !reelUrl || !societyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (groupId === "public") {
      const message = new BuzzMessage({
        sender: senderId,
        senderName: sender.name,
        content: "Shared a reel",
        fileUrl: reelUrl,
        fileType: "reel",
        group: null,
        societyId,
        isPublicGroup: true,
      });

      await message.save();
      return res
        .status(200)
        .json({ message: "Reel sent to Public Group", data: message });
    }

    if (groupId) {
      const message = new BuzzMessage({
        sender: senderId,
        senderName: sender.name,
        content: "Shared a reel",
        fileUrl: reelUrl,
        fileType: "reel",
        group: groupId,
        societyId,
      });

      await message.save();
      return res
        .status(200)
        .json({ message: "Reel sent to group", data: message });
    }

    if (receiverId) {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        fileUrl: reelUrl,
        fileType: "reel",
        societyId,
        text: "Shared a reel",
      });

      await message.save();
      return res
        .status(200)
        .json({ message: "Reel sent to chat", data: message });
    }

    return res
      .status(400)
      .json({ message: "receiverId or groupId must be provided" });
  } catch (error) {
    console.error("Error sending reel:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
