import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import Society from "../Models/Society.js";
import JoinRequest from "../Models/JoinRequest.js"
import Home from "../Models/Home.js";
// For example only — replace with actual DB model if you store electricity bills separately

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

    // Validate required fields
    if (
      !name || !email || !phone_no || !address ||
      !password || !confirm_password || !electricity_bill_no
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    // Find or create home based on bill number
    let home = await Home.findOne({ electricity_bill_no });
    if (!home) {
      home = new Home({
        electricity_bill_no,
        residents: [],
      });
      await home.save();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      user_id: uuidv4(),
      name,
      email,
      phone_no,
      address,
      password: hashedPassword,
      home_id: home._id,
      is_approved: false,
    });

    await newUser.save();

    // Add user to home residents
    home.residents.push(newUser._id);
    await home.save();

    console.log("⚠️ New registration pending admin approval:", newUser.name);

    return res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      user_id: newUser.user_id,
      home_id: home._id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.is_approved) {
      return res.status(403).json({ message: "Waiting for admin approval" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        user_id: user.user_id,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST : /api/society/create
export const createSociety = async (req, res) => {
  const { name, location } = req.body;
  const userId = req.user._id;

  const society = await Society.create({
    name,
    location,
    created_by: userId,
    residents: [userId],
  });

  await User.findByIdAndUpdate(userId, {
    role: "admin",
    created_society: society._id,
  });

  res.status(201).json({ message: "Society created", society });
};

// POST : /api/society/:id/join
export const requestJoinSociety = async (req, res) => {
  const userId = req.user._id;
  const societyId = req.params.id;

  const existing = await JoinRequest.findOne({
    user_id: userId,
    society_id: societyId,
  });
  if (existing) return res.status(400).json({ message: "Already requested" });

  const request = await JoinRequest.create({
    user_id: userId,
    society_id: societyId,
  });
  res.status(201).json({ message: "Join request sent", request });
};
