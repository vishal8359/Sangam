import Group from "../Models/Group.js";
import GroupJoinRequest from "../Models/GroupJoinRequest.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import User from "../Models/User.js";
import BuzzMessage from "../Models/BuzzMessage.js";
import BuzzGroup from "../Models/BuzzGroup.js";
import mongoose from "mongoose";
export const createBuzzGroup = async (req, res) => {
  try {
    const { groupName, members, societyId } = req.body;

    if (!groupName || !members || !societyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newGroup = await BuzzGroup.create({
      groupName,
      members,
      societyId,
    });

    res.status(201).json({ success: true, group: newGroup });
  } catch (err) {
    console.error("Error creating buzz group:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBuzzGroups = async (req, res) => {
  try {
    const { societyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(societyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid societyId" });
    }

    console.log("👉 Fetching buzz groups for societyId:", societyId);

    const groups = await BuzzGroup.find({
      societyId: new mongoose.Types.ObjectId(societyId),
    });

    console.log("📦 Found groups:", groups);

    res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error("❌ Failed to fetch buzz groups:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching buzz groups" });
  }
};


export const getSocietyMembers = async (req, res) => {
  try {
    const { societyId } = req.params;

    // This matches your working route
    const users = await User.find({ joined_societies: societyId }).select(
      "_id name email avatar"
    );

    res.json(users); // no need to wrap in { success: true, ... }
  } catch (err) {
    console.error("❌ Error fetching buzz members:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get all groups for a society
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

// Get detailed group info (with posts and usernames)
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate("posts.user", "name email")
      .populate("created_by", "name email");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (err) {
    console.error("Group details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Post a message or media in a group
export const postInGroup = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check membership
    if (!group.members.map((m) => m.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: "Access denied: Not a member" });
    }

    // Handle media uploads
    const media = {};
    if (req.files?.image?.length) {
      media.image = await uploadToCloudinary(
        req.files.image[0].path,
        "buzz/posts/images"
      );
    }
    if (req.files?.audio?.length) {
      media.audio = await uploadToCloudinary(
        req.files.audio[0].path,
        "buzz/posts/audio"
      );
    }
    if (req.files?.reel?.length) {
      media.reel = await uploadToCloudinary(
        req.files.reel[0].path,
        "buzz/posts/reels"
      );
    }

    if (!text?.trim() && Object.keys(media).length === 0) {
      return res.status(400).json({ message: "Post must have text or media." });
    }

    const newPost = {
      user: userId,
      text: text?.trim() || "",
      media: Object.keys(media).length ? media : undefined,
      created_at: new Date(),
    };
    group.posts.push(newPost);
    await group.save();

    // Populate the returned post user info
    const populatedPost = await Group.findOne(
      { _id: groupId },
      { posts: { $slice: -1 } }
    ).populate("posts.user", "name email");

    res
      .status(201)
      .json({ message: "Post added", post: populatedPost.posts[0] });
  } catch (err) {
    console.error("Post in group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Request to join a group
export const requestToJoinGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check existing membership or pending request
    const alreadyMember = group.members
      .map((m) => m.toString())
      .includes(userId.toString());
    const pending = await GroupJoinRequest.findOne({
      group: groupId,
      user: userId,
    });
    if (alreadyMember)
      return res.status(400).json({ message: "Already a member" });
    if (pending)
      return res.status(400).json({ message: "Request already pending" });

    const joinReq = await GroupJoinRequest.create({
      group: groupId,
      user: userId,
    });
    res.status(201).json({ message: "Join request sent", request: joinReq });
  } catch (err) {
    console.error("Join request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerBuzzHandlers = (io, socket) => {
  // Join the socket.io “room” for a given society
  socket.on("joinBuzz", (societyId) => {
    socket.join(societyId);
  });

  // Handle incoming buzz messages
  socket.on("sendBuzzMessage", async (data) => {
    const {
      societyId,
      groupId = null,
      sender,
      senderName,
      content,
      fileUrl,
      fileType,
      audioUrl,
    } = data;

    try {
      const msg = await BuzzMessage.create({
        sender,
        senderName,
        content,
        group: groupId,
        societyId,
        fileUrl,
        fileType,
        audioUrl, // ✅ And save it
      });

      io.to(societyId).emit("receiveBuzzMessage", msg);
    } catch (err) {
      console.error("⚠️ Error saving buzz message:", err);
    }
  });
};
export const getMessages = async (req, res) => {
  try {
    const { societyId } = req.params;
    const userId = req.user._id;

    const messages = await BuzzMessage.find({
      societyId,
      deletedFor: { $ne: userId },
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Get buzz messages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const uploadVoiceMessage = async (req, res) => {
  try {
    const { societyId, groupId, sender, senderName } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Use utility to upload to Cloudinary
    const { url: audioUrl } = await uploadToCloudinary(
      audioFile.buffer,
      "buzz/audio",
      audioFile.mimetype
    );

    const newMessage = await BuzzMessage.create({
      sender,
      senderName,
      content: "🎤 Voice Message",
      audio: audioUrl,
      societyId,
      group: groupId || null,
    });

    const io = req.app.get("socketio");
    io.to(societyId).emit("receiveBuzzMessage", newMessage);

    res.status(200).json({ url: audioUrl });
  } catch (err) {
    console.error("Audio upload error:", err);
    res.status(500).json({ error: "Server error during audio upload" });
  }
};

export const uploadBuzzFile = async (req, res) => {
  try {
    if (!req.file) {
      console.log("❌ No file received in req.file");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📦 File received:", req.file.originalname);

    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;

    const uploadResult = await uploadToCloudinary(
      buffer,
      "buzz_uploads",
      mimetype
    );

    return res.status(200).json({
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error("📤 Upload failed:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const deleteBuzzMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await BuzzMessage.findById(messageId);
    if (!message.deletedFor) message.deletedFor = [];

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.deletedFor.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Message already deleted for you" });
    }

    message.deletedFor.push(userId);
    await message.save();

    const io = req.app.get("socketio");
    io.to(userId.toString()).emit("buzz message deleted for me", { messageId });

    res.status(200).json({ message: "Message deleted for you" });
  } catch (err) {
    console.error("❌ Delete for me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE for Everyone
export const deleteBuzzMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await BuzzMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Allow only sender or admin to delete for all
    const isAdmin = req.user.role === "admin"; // assuming user has a role field
    const isSender = message.sender.toString() === userId.toString();
    if (!isSender && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete for all" });
    }

    await BuzzMessage.findByIdAndDelete(messageId);

    const io = req.app.get("socketio");
    io.to(message.societyId.toString()).emit("buzz message deleted for all", {
      messageId,
    });

    res.status(200).json({ message: "Message deleted for everyone" });
  } catch (err) {
    console.error("❌ Delete for all error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
