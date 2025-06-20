import Group from "../Models/Group.js";
import GroupJoinRequest from "../Models/GroupJoinRequest.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import User from "../Models/User.js";

// Create a group
export const createGroup = async (req, res) => {
  try {
    const { name, description, society_id } = req.body;

    if (!name || !society_id) {
      return res.status(400).json({ message: "Name and society_id are required" });
    }

    const group = await Group.create({
      name,
      description,
      society_id,
      created_by: req.user._id // set from logged-in admin
    });

    res.status(201).json({ message: "Group created", group });
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all groups by society
export const getGroupsBySociety = async (req, res) => {
  try {
    const { societyId } = req.params;

    const groups = await Group.find({ society_id: societyId });
    res.status(200).json(groups);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed group info (with posts & user names)
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate("posts.user", "name");
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group);
  } catch (err) {
    console.error("Group details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Post in group
export const postInGroup = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await User.findById(userId);
    const isMember = user.roles.some(
      (role) => role.society_id?.toString() === group.society_id?.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied: Not a member of this society." });
    }

    // Handle file uploads (Multer adds files to req.files)
    const media = {};

    if (req.files?.image?.[0]) {
      media.image = await uploadToCloudinary(req.files.image[0].path, "buzz/posts/images");
    }
    if (req.files?.audio?.[0]) {
      media.audio = await uploadToCloudinary(req.files.audio[0].path, "buzz/posts/audio");
    }
    if (req.files?.reel?.[0]) {
      media.reel = await uploadToCloudinary(req.files.reel[0].path, "buzz/posts/reels");
    }

    if (!text && Object.keys(media).length === 0) {
      return res.status(400).json({ message: "Post must have text or media." });
    }

    const newPost = {
      user: userId,
      text: text?.trim() || "",
      created_at: new Date(),
      media: Object.keys(media).length ? media : undefined,
    };

    group.posts.push(newPost);
    await group.save();

    res.status(201).json({
      message: "Post added successfully",
      post: group.posts[group.posts.length - 1],
    });
  } catch (err) {
    console.error("❌ Post in group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

