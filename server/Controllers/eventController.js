import Event from "../Models/Event.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import moment from "moment";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { eventName, organiserName, date, time, place, isNeighbourEvent } = req.body;
    const userId = req.user._id;

    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      imageUrl = result.secure_url;
    }

    const newEvent = new Event({
      eventName,
      organiserName,
      date,
      time,
      place,
      image: imageUrl,
      isNeighbourEvent,
      createdBy: userId,
    });

    await newEvent.save();

    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cancel Event (marks event as cancelled)
export const cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.cancelled = true;
    await event.save();

    res.status(200).json({ message: "Event cancelled successfully", event });
  } catch (err) {
    console.error("Error cancelling event:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Events for Users (non-cancelled, sorted by date)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ cancelled: false }).sort({ date: 1 });

    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rsvpToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["going", "interested", "not_going"].includes(status)) {
      return res.status(400).json({ message: "Invalid RSVP status" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.cancelled) return res.status(400).json({ message: "Event is cancelled" });

    // Capacity check
    if (status === "going" && event.capacity > 0) {
      const goingCount = event.rsvps.filter(r => r.status === "going").length;
      if (goingCount >= event.capacity) {
        return res.status(400).json({ message: "Event capacity full" });
      }
    }

    // Check if user already RSVP'd
    const existing = event.rsvps.find(r => r.user.toString() === userId.toString());
    if (existing) {
      existing.status = status; // update
    } else {
      event.rsvps.push({ user: userId, status });
    }

    await event.save();
    res.status(200).json({ message: "RSVP updated", rsvps: event.rsvps });
  } catch (err) {
    console.error("Error updating RSVP:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Comment on event
export const commentOnEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.comments.push({
      user: userId,
      text,
    });

    await event.save();
    res.status(200).json({ message: "Comment added", comments: event.comments });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};