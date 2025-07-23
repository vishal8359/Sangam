// server/Controllers/adminController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";
import JoinRequest from "../Models/JoinRequest.js";
import Society from "../Models/Society.js";
import sendEmail from "../Utils/emailService.js";
import sendSMS from "../Utils/smsService.js";

// Admin login
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

    const hasAdminRole = user.roles.some((r) => r.role === "admin");
    if (!hasAdminRole) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        roles: user.roles.filter((r) => r.role === "admin"),
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch pending join requests
export const getPendingJoinRequests = async (req, res) => {
  try {
    const pendingRequests = await JoinRequest.find({ status: "pending" })
      .populate({
        path: "user_id",
        select: "user_id name email phone_no address avatar", // include full address
      })
      .populate({
        path: "society_id",
        select: "name location", // include location if needed
      });

    res.status(200).json({ requests: pendingRequests });
  } catch (err) {
    console.error("Error fetching pending join requests:", err);
    res.status(500).json({ message: "Server error fetching requests" });
  }
};

// Approve a join request
export const approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ message: "Join request not found." });

    if (request.status === "approved") {
      return res.status(400).json({ message: "Request already approved." });
    }

    const user = await User.findById(request.user_id);
    const society = await Society.findById(request.society_id);

    if (!user || !society) {
      return res.status(404).json({ message: "User or society not found." });
    }

    // Update request
    request.status = "approved";
    request.approved_at = new Date();
    await request.save();

    // Update user
    const existingRole = user.roles.some(
      (r) =>
        r.role === "resident" &&
        r.society_id.toString() === society._id.toString()
    );

    if (!existingRole) {
      user.roles.push({ role: "resident", society_id: society._id });
    }

    user.is_approved = true;
    user.joined_societies = user.joined_societies || [];

    if (!user.joined_societies.includes(society._id)) {
      user.joined_societies.push(society._id);
    }

    await user.save();

    // Update society
    await Society.findByIdAndUpdate(society._id, {
      $addToSet: { residents: user._id },
    });

    // Notifications
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Join Request Approved",
        text: `Hi ${user.name}, your request to join "${society.name}" has been approved.`,
      });
    }

    if (user.phone_no) {
      await sendSMS(
        user.phone_no,
        `✅ Hi ${user.name}, your request to join "${society.name}" has been approved.`
      );
    }

    return res.status(200).json({ message: "User approved and notified." });
  } catch (err) {
    console.error("Approval error:", err);
    return res.status(500).json({ message: "Server error during approval." });
  }
};

// Reject a join request
export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject a request that is already ${request.status}`,
      });
    }

    const user = await User.findById(request.user_id);
    const society = await Society.findById(request.society_id);

    if (!user || !society) {
      return res.status(404).json({ message: "User or society not found" });
    }

    request.status = "rejected";
    request.rejected_at = new Date();
    await request.save();

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Join Request Rejected",
        text: `Hi ${user.name}, your request to join "${society.name}" has been rejected.`,
      });
    }

    if (user.phone_no) {
      await sendSMS(
        user.phone_no,
        `❌ Hi ${user.name}, your request to join "${society.name}" has been rejected.`
      );
    }

    res.status(200).json({ message: "Request rejected and user notified" });
  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ message: "Server error during rejection" });
  }
};
