import Invitation from "../Models/Invitation.js";
import Event from "../Models/Event.js";

export const sendInvites = async (req, res) => {
  try {
    const { eventId, invitees } = req.body;
    const userId = req.user._id;

    if (!eventId || !Array.isArray(invitees)) {
      return res.status(400).json({ message: "Event ID and invitees required" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const invites = invitees.map(user => ({
      event: eventId,
      invitedUser: user,
      invitedBy: userId,
    }));

    await Invitation.insertMany(invites);

    res.status(201).json({ message: "Invitations sent" });
  } catch (err) {
    console.error("Send invites error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvitedEvents = async (req, res) => {
  try {
    const invites = await Invitation.find({ invitedUser: req.user._id }).populate("event");
    const events = invites.map(inv => inv.event).filter(ev => ev && !ev.cancelled);
    res.status(200).json({ events });
  } catch (err) {
    console.error("Get invited events error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
