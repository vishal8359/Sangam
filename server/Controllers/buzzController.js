
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
    const groups = await BuzzGroup.find({
      societyId: new mongoose.Types.ObjectId(societyId),
    });
    res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error("Failed to fetch buzz groups:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching buzz groups" });
  }
};

export const getSocietyMembers = async (req, res) => {
  try {
    const { societyId } = req.params;
    const users = await User.find({ joined_societies: societyId }).select(
      "_id name email avatar"
    );
    res.json(users);
  } catch (err) {
    console.error("Error fetching buzz members:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const registerBuzzHandlers = (io, socket) => {
  socket.on("joinBuzz", (societyId) => {
    socket.join(societyId);
  });

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
        audioUrl,
      });
      io.to(societyId).emit("receiveBuzzMessage", msg);
    } catch (err) {
      console.error("Error saving buzz message:", err);
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
    const uploadedAudio = await uploadToCloudinary(
      audioFile.buffer,
      "buzz/audio",
      audioFile.mimetype
    );
    const newMessage = await BuzzMessage.create({
      sender,
      senderName,
      content: "🎤 Voice Message",
      audio: uploadedAudio.secure_url,
      societyId,
      group: groupId || null,
    });
    const io = req.app.get("socketio");
    io.to(societyId).emit("receiveBuzzMessage", newMessage);
    res.status(200).json({ url: uploadedAudio.secure_url });
  } catch (err) {
    console.error("Audio upload error:", err);
    res.status(500).json({ error: "Server error during audio upload" });
  }
};

export const uploadBuzzFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const uploadResult = await uploadToCloudinary(
      buffer,
      "buzz_uploads",
      mimetype
    );
    return res.status(200).json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const deleteBuzzMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await BuzzMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (!message.deletedFor) message.deletedFor = [];
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
    console.error("Delete for me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBuzzMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await BuzzMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    const isAdmin = req.user.role === "admin";
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
    console.error("Delete for all error:", err);
    res.status(500).json({ message: "Server error" });
  }
};