// server/Controllers/adminController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";
import JoinRequest from "../Models/JoinRequest.js";
import Society from "../Models/Society.js";
import sendEmail from "../Utils/emailService.js";
import sendSMS from "../Utils/smsService.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check if user has any admin role
    const hasAdminRole = user.roles.some((r) => r.role === "admin");
    if (!hasAdminRole) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        roles: user.roles.filter((r) => r.role === "admin"), // optional: show only admin roles
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status === "approved") return res.status(400).json({ message: "Already approved" });

    const user = await User.findById(request.user_id);
    const society = await Society.findById(request.society_id);

    if (!user || !society) return res.status(404).json({ message: "User or society not found" });

    // ✅ Add user to society's residents if not already
    if (!society.residents.includes(user._id)) {
      society.residents.push(user._id);
      await society.save();
    }

    // ✅ Add society to joined_societies if not already
    const isAlreadyJoined = user.joined_societies.some(
      (id) => id.toString() === society._id.toString()
    );
    if (!isAlreadyJoined) {
      user.joined_societies.push(society._id);
    }

    // ✅ Add resident role if not already present
    const hasResidentRole = user.roles.some(
      (r) => r.society_id.toString() === society._id.toString()
    );
    if (!hasResidentRole) {
      user.roles.push({ society_id: society._id, role: "resident" });
    }

    // ✅ Update user approval
    user.is_approved = true;

    // ✅ Save updated user and request
    await Promise.all([user.save(), request.updateOne({ status: "approved", approved_at: new Date() })]);

    // ✅ Send notifications
    await sendEmail({
      to: user.email,
      subject: "Your Join Request is Approved",
      text: `Hi ${user.name}, your request to join the society "${society.name}" has been approved.`,
    });

    await sendSMS(user.phone_no, `✅ Hi ${user.name}, your request to join "${society.name}" has been approved.`);

    return res.status(200).json({ message: "User approved and added to society" });

  } catch (err) {
    console.error("❌ Approval error:", err);
    return res.status(500).json({ message: "Server error during approval" });
  }
};


export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const user = await User.findById(request.user_id);
    const society = await Society.findById(request.society_id);

    if (!user || !society) {
      return res.status(404).json({ message: "User or society not found" });
    }

    request.status = "rejected";
    await request.save();

    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: "Join Request Rejected",
      text: `Hi ${user.name}, we regret to inform you that your request to join "${society.name}" has been rejected.`,
    });

    // Send rejection SMS
    await sendSMS(user.phone_no, `❌ Hi ${user.name}, your request to join "${society.name}" has been rejected.`);

    res.status(200).json({ message: "Request rejected and user notified" });

  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ message: "Server error during rejection" });
  }
};
