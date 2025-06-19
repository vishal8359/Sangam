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

    const userId = request.user_id;
    const societyId = request.society_id;

    // Approve the request
    request.status = "approved";
    request.approved_at = new Date();
    await request.save();

    // Add user to society's residents using $addToSet to prevent duplicates
    await Society.findByIdAndUpdate(societyId, {
      $addToSet: { residents: userId },
    });

    // Add role and society only if not already present
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        joined_societies: societyId,
        roles: {
          society_id: societyId,
          role: "resident",
        },
      },
      $set: {
        is_approved: true,
      },
    });

    const user = await User.findById(userId);
    const society = await Society.findById(societyId);

    // Send Notifications
    await sendEmail({
      to: user.email,
      subject: "Your Join Request is Approved",
      text: `Hi ${user.name}, your request to join the society "${society.name}" has been approved.`,
    });

    await sendSMS(user.phone_no, `✅ Hi ${user.name}, your request to join "${society.name}" has been approved.`);

    res.status(200).json({ message: "User approved and added to society" });

  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Server error during approval" });
  }
};

export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Prevent rejecting if already approved or rejected
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Cannot reject a request that is already ${request.status}` });
    }

    const user = await User.findById(request.user_id);
    const society = await Society.findById(request.society_id);

    if (!user || !society) {
      return res.status(404).json({ message: "User or society not found" });
    }

    // Mark request as rejected
    request.status = "rejected";
    request.rejected_at = new Date();
    await request.save();

    // Notify user via email and SMS
    await sendEmail({
      to: user.email,
      subject: "Join Request Rejected",
      text: `Hi ${user.name}, we regret to inform you that your request to join "${society.name}" has been rejected.`,
    });

    await sendSMS(
      user.phone_no,
      `❌ Hi ${user.name}, your request to join "${society.name}" has been rejected.`
    );

    return res.status(200).json({ message: "Request rejected and user notified" });

  } catch (err) {
    console.error("❌ Rejection error:", err);
    return res.status(500).json({ message: "Server error during rejection" });
  }
};

