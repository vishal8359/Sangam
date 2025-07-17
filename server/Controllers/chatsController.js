import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Chat from "../Models/Chats.js";
import User from "../Models/User.js";
import streamifier from "streamifier";
import connectCloudinary from "../Configs/cloudinary.js"

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text, societyId } = req.body;

    if (!sender || !receiver || !text || !societyId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const message = await Chat.create({ sender, receiver, text, societyId });
    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: 1 }); // oldest to latest

    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("Get my chats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSocietyUsers = async (req, res) => {
  try {
    const { societyId } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(societyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Society ID" });
    }

    const societyObjectId = new mongoose.Types.ObjectId(societyId);

    const users = await User.find({
      $or: [
        { joined_societies: societyObjectId },
        { created_society: societyObjectId },
      ],
    })
      .select("name avatar _id joined_societies created_society")
      .lean();

    const filtered = users.filter(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    res.status(200).json({ success: true, users: filtered });
  } catch (err) {
    console.error("❌ Error fetching society users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getChatHistory = async (req, res) => {
  const { userId, peerId } = req.params;

  try {
    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: peerId },
        { sender: peerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("❌ Failed to fetch chat history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadChatFile = async (req, res) => {
  try {
    await connectCloudinary(); 

    const { sender, receiver, societyId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "chat_files",
            resource_type: "auto", 
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload(file.buffer);

    const newMessage = await Chat.create({
      sender,
      receiver,
      societyId,
      text: "",
      fileUrl: result.secure_url,
      fileType: file.mimetype,
    });

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


// DELETE /api/users/chats/:id
export const deleteMessage = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const forWhom = req.query.for; // "self" or "everyone"

  try {
    const message = await Chat.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (forWhom === "self") {
      // Only mark as deleted for this user (frontend can decide to hide)
      message.deletedFor = message.deletedFor || [];
      message.deletedFor.push(userId);
      await message.save();
      return res.status(200).json({ message: "Deleted for self" });
    }

    // Delete for everyone if sender
    if (String(message.sender) === String(userId)) {
      await message.deleteOne();
      return res.status(200).json({ message: "Deleted for everyone" });
    }

    return res.status(403).json({ message: "Not authorized" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};
