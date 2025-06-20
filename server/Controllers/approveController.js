import User from "../Models/User.js";
import sendSMS from "../Utils/smsService.js"; // or adjust path
import sendEmail from "../Utils/emailService.js"; // or adjust path


export const getPendingUsers = async (req, res) => {
  try {
    const pendingRequests = await JoinRequest.find({ status: "pending" })
      .populate("user_id", "name email phone_no")
      .populate("society_id", "name location");

    if (!pendingRequests.length) {
      return res.status(200).json({ message: "No pending join requests." });
    }

    res.status(200).json({
      message: "Pending join requests fetched successfully",
      requests: pendingRequests,
    });
  } catch (err) {
    console.error("Error fetching join requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};

