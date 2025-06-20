// Controllers/groupJoinController.js
import GroupJoinRequest from "../Models/GroupJoinRequest.js";
import Group from "../Models/Group.js";
import sendEmail from "../Utils/emailService.js";
import sendSMS from "../Utils/smsService.js";
import User from "../Models/User.js";


export const requestToJoinGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    // Check if already requested
    const existing = await GroupJoinRequest.findOne({ user_id: userId, group_id: groupId });
    if (existing) {
      return res.status(400).json({ message: "Already requested to join this group." });
    }

    const request = await GroupJoinRequest.create({
      user_id: userId,
      group_id: groupId,
    });

    res.status(201).json({ message: "Join request sent.", request });
  } catch (err) {
    console.error("Join group request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const approveGroupJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await GroupJoinRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    const [group, user] = await Promise.all([
      Group.findById(request.group_id),
      User.findById(request.user_id),
    ]);

    if (!group || !user) return res.status(404).json({ message: "Group or user not found" });

    if (!group.members.includes(user._id)) {
      group.members.push(user._id);
    }

    request.status = "approved";
    await Promise.all([group.save(), request.save()]);

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Group Join Request Approved",
      text: `Hi ${user.name}, your request to join the group "${group.name}" has been approved.`,
    });

    // Send SMS
    await sendSMS(user.phone_no, `✅ Hi ${user.name}, your request to join group "${group.name}" has been approved.`);

    res.status(200).json({ message: "User added to group and notified", group });
  } catch (err) {
    console.error("Approve group join error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const rejectGroupJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await GroupJoinRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    const user = await User.findById(request.user_id);
    const group = await Group.findById(request.group_id);

    request.status = "rejected";
    await request.save();

    if (user && group) {
      // Send email
      await sendEmail({
        to: user.email,
        subject: "Group Join Request Rejected",
        text: `Hi ${user.name}, your request to join the group "${group.name}" has been rejected.`,
      });

      // Send SMS
      await sendSMS(user.phone_no, `❌ Hi ${user.name}, your request to join group "${group.name}" has been rejected.`);
    }

    res.status(200).json({ message: "Join request rejected and user notified" });
  } catch (err) {
    console.error("Reject group join error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
