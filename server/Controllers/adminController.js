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
    const admin = await User.findOne({ email });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      admin: { name: admin.name, email: admin.email, role: admin.role },
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

    // Approve the request
    request.status = "approved";
    await request.save();

    // Add user to society residents
    society.residents.push(user._id);
    await society.save();

    // Update user’s joined_society field
    user.joined_society = society._id;
    user.is_approved = true;
    await user.save();

    // Send notifications
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
