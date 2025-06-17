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
    await sendSMS(user.phone_no, `✅ You are approved. Your user ID is ${user.user_id}, home ID is ${user.home_id}`);
    await sendEmail(
      user.email,
      "🎉 Society App Approval",
      `Hi ${user.name},\n\nYou have been approved!\nUser ID: ${user.user_id}\nHome ID: ${user.home_id}`
    );

    res.status(200).json({ message: "User approved and notified" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/society/request/:requestId/approve
export const approveJoinRequest = async (req, res) => {
  console.log("Request ID received:", req.params.requestId);
  try {
    const request = await JoinRequest.findById(req.params.requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already handled" });
    }

    const user = await User.findById(request.user_id);
    const society = await Society.findById(request.society_id);

    if (!user || !society) {
      return res.status(404).json({ message: "User or society not found" });
    }
    if (!user.joined_societies.includes(society._id)) {
      user.joined_societies.push(society._id);
    }

    if (!society.residents.includes(user._id)) {
      society.residents.push(user._id);
    }
    // Update records
    user.role = "resident";
    // user.joined_society = society._id;
    // society.residents.push(user._id);
    request.status = "approved";
    request.approved_at = new Date();

    await Promise.all([user.save(), society.save(), request.save()]);

    // Notify user
    await sendEmail({
      to: user.email,
      subject: "Join Request Approved",
      text: `Hi ${user.name}, your request to join "${society.name}" has been approved.`,
    });

    await sendSMS(
      user.phone_no,
      `✅ Hi ${user.name}, your request to join "${society.name}" has been approved.`
    );

    res.json({ message: "User approved and notified", user });
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

export const rejectJoinRequest = async (req, res) => {
  const { request_id } = req.params;

  const request = await JoinRequest.findById(request_id);
  if (!request) return res.status(404).json({ message: "Request not found" });

  const user = await User.findById(request.user_id);
  const society = await Society.findById(request.society_id);

  if (user && society) {
    await sendEmail({
      to: user.email,
      subject: "Your Join Request is Rejected",
      text: `Hi ${user.name}, your request to join "${society.name}" has been rejected.`,
    });

    await sendSMS(
      user.phone_no,
      `❌ Hi ${user.name}, your request to join "${society.name}" has been rejected.`
    );
  }

  request.status = "rejected";
  await request.save();

  res.status(200).json({ message: "Request rejected" });
};
