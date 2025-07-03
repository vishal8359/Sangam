import mongoose from "mongoose";
import Event from "../Models/Event.js";
import Invitation from "../Models/Invitation.js";
import User from "../Models/User.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";

export const createEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const societyId = req.user.societyId;

    const {
      eventName,
      organiserName,
      description,
      date,
      time,
      place,
      isNeighbourEvent,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.path);
      console.log("🔹 Cloudinary upload result:", uploaded);
      imageUrl = uploaded.url;
    }

    const event = new Event({
      society: societyId,
      eventName: eventName?.trim(),
      organiserName: organiserName?.trim(),
      description: description?.trim(),
      date,
      time,
      place: place?.trim(),
      isNeighbourEvent: isNeighbourEvent === "true",
      createdBy: userId,
      image: imageUrl,
    });

    await event.save();
    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const inviteToEvent = async (req, res) => {
  try {
    const { eventId, invitees } = req.body;
    const userId = req.user._id;
    const societyId = req.user.societyId;

    if (!eventId || !Array.isArray(invitees)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const event = await Event.findOne({ _id: eventId, society: societyId });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const validUsers = await User.find({
      _id: { $in: invitees },
      $or: [{ created_society: societyId }, { joined_societies: societyId }],
    }).select("_id");

    if (validUsers.length !== invitees.length) {
      return res.status(400).json({ message: "Some users are invalid" });
    }

    const invitations = invitees.map((uid) => ({
      event: eventId,
      invitedUser: uid,
      invitedBy: userId,
    }));

    await Invitation.insertMany(invitations);
    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { invitedUsers: { $each: invitees } },
    });

    res.status(201).json({ message: "Invites sent", count: invitees.length });
  } catch (err) {
    console.error("Invite Error:", err);
    res.status(500).json({ message: "Failed to send invites" });
  }
};

// Controllers/userController.js
export const getSocietyMembers = async (req, res) => {
  try {
    const societyId = req.user.societyId;

    const members = await User.find({
      $or: [{ created_society: societyId }, { joined_societies: societyId }],
    }).select("_id name avatar address"); // Add any fields needed in invite UI

    res.status(200).json(members);
  } catch (err) {
    console.error("Error fetching society members:", err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const societyId = req.user.societyId;
    const userId = req.user._id;

    if (!societyId || !userId) {
      return res.status(400).json({ message: "Missing user or society info" });
    }

    const events = await Event.find({
      society: new mongoose.Types.ObjectId(societyId),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    res.status(200).json({ events });
  } catch (err) {
    console.error("Get Events Error:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};
