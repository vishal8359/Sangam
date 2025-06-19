import User from "../Models/User.js";
import sendSMS from "../Utils/smsService.js"; // or adjust path
import sendEmail from "../Utils/emailService.js"; // or adjust path

export const approveResident = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ user_id: userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_approved) {
      return res.status(400).json({ message: "User already approved" });
    }

    user.is_approved = true;
    await user.save();

    // Send notifications
    await sendSMS(
      user.phone_no,
      `✅ You are approved. Your user ID is ${user.user_id}, home ID is ${user.home_id}`
    );
    await sendEmail({
      to: user.email,
      subject: "🎉 Society App Approval",
      text: `Hi ${user.name},\n\nYou have been approved!\nUser ID: ${user.user_id}\nHome ID: ${user.home_id}`,
    });

    res.status(200).json({ message: "User approved and notified" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


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

