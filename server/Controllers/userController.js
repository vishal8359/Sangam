import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// For example only — replace with actual DB model if you store electricity bills separately
const getHomeIdByBillNumber = async (bill_no) => {
  const existingUser = await User.findOne({ electricity_bill_no: bill_no });
  return existingUser?.home_id || null;
};

export const registerResident = async (req, res) => {
  try {
    const {
      name,
      email,
      phone_no,
      address,
      password,
      confirm_password,
      electricity_bill_no,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone_no ||
      !address ||
      !password ||
      !confirm_password ||
      !electricity_bill_no
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      $or: [{ phone_no }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user_id
    const user_id = uuidv4();

    // Check if home_id exists for given bill number
    let home_id = await getHomeIdByBillNumber(electricity_bill_no);

    // If not, generate a new home_id
    if (!home_id) home_id = uuidv4();

    const newUser = new User({
      user_id,
      name,
      email,
      phone_no,
      address,
      password: hashedPassword,
      home_id,
      is_approved: false, // Wait for admin approval
    });

    await newUser.save();

    // Admin notification logic placeholder
    // In actual app: send socket/push/email notification to admin
    console.log("⚠️ New registration pending admin approval:", newUser.name);

    return res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      user_id,
      home_id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
