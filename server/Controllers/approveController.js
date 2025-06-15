import User from "../Models/User.js";
import sendSMS from "../Utils/smsService.js"; // or adjust path
import sendEmail from "../Utils/emailService.js"; // or adjust path

export const approveResident = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_approved)
      return res.status(400).json({ message: "User already approved" });

    user.is_approved = true;
    await user.save();

    const smsText = `Welcome to Sangam Society! Your User ID: ${user.user_id}, Home ID: ${user.home_id}`;
    await sendSMS(user.phone_no, smsText);

    const emailText = `
      Hello ${user.name},

      Your registration has been approved!
      User ID: ${user.user_id}
      Home ID: ${user.home_id}

      Welcome to Sangam Society!
    `;
    await sendEmail(user.email, "Sangam Society Approval", emailText);

    res.status(200).json({ message: "User approved and notified." });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
