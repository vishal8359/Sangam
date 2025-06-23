import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import Society from "../Models/Society.js";
import JoinRequest from "../Models/JoinRequest.js";
import Home from "../Models/Home.js";
import sendSMS from "../Utils/smsService.js";
import { extractSortOrder } from "./getNeighbourHomes.js";
// For example only — replace with actual DB model if you store electricity bills separately
const pendingRegistrations = new Map();

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

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    pendingRegistrations.set(phone_no, {
      name,
      email,
      address,
      password,
      electricity_bill_no,
      otp,
      otpExpiry,
    });

    console.log(
      "⚠️ Registration initiated. Awaiting OTP verification:",
      phone_no
    );
    await sendSMS(
      phone_no,
      `🔐 Your OTP for Society registration is: ${otp}. Valid for 5 minutes.`
    );

    return res.status(200).json({
      message: "OTP sent for verification",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone_no, otp } = req.body;

  try {
    const pendingData = pendingRegistrations.get(phone_no);

    if (!pendingData) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    // if (pendingData.otp !== otp || Date.now() > pendingData.otpExpiry) {
    //   return res.status(400).json({ message: "Invalid or expired OTP" });
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(pendingData.password, 10);

    // Check or create Home
    const [houseNumber, ...rest] = pendingData.address.split(",");
    const street = rest.join(",").trim();
    let home = await Home.findOne({
      electricity_bill_no: pendingData.electricity_bill_no,
      street: street,
      houseNumber: houseNumber.trim(),
    });

    if (!home) {
      home = await Home.create({
        electricity_bill_no: pendingData.electricity_bill_no,
        street: street,
        houseNumber: houseNumber.trim(),
        houseSortOrder: extractSortOrder(houseNumber),
        residents: [],
      });
    }

    const newUser = await User.create({
      user_id: uuidv4(),
      name: pendingData.name,
      email: pendingData.email,
      phone_no,
      address: pendingData.address,
      password: hashedPassword,
      home_id: home._id,
      is_approved: true,
      is_verified: true,
      roles: [],
    });

    home.residents.push(newUser._id);
    await home.save();

    pendingRegistrations.delete(phone_no);
    await sendSMS(
      phone_no,
      `✅ Registration complete! Dear ${newUser.name}, this is your User ID: ${newUser.user_id} \n and Home ID: ${home._id}\nWelcome to the society app.`
    );
    res.status(201).json({
      message: "Phone verified and user registered successfully",
      user_id: newUser.user_id,
      home_id: home._id,
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ message: "Server error" });
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

  try {
    // Validate location
    if (
      !location ||
      location.type !== "Polygon" ||
      !Array.isArray(location.coordinates)
    ) {
      return res.status(400).json({
        message: "Invalid location format. Must be GeoJSON Polygon.",
      });
    }
    if (
      location.type === "Polygon" &&
      location.coordinates.length &&
      location.coordinates[0][0] !==
        location.coordinates[0][location.coordinates[0].length - 1]
    ) {
      location.coordinates[0].push(location.coordinates[0][0]); 
    }

    const society = await Society.create({
      name,
      location,
      created_by: userId,
      residents: [userId],
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        roles: {
          society_id: society._id,
          role: "admin",
        },
      },
      created_society: society._id,
    });

    res.status(201).json({ message: "Society created", society });
  } catch (error) {
    console.error("Error creating society:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST : /api/society/:id/join
export const requestJoinSociety = async (req, res) => {
  try {
    const userId = req.user._id;
    const societyId = req.params.id;

    // Check if a pending or approved request already exists
    const existing = await JoinRequest.findOne({
      user_id: userId,
      society_id: societyId,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(400).json({
        message:
          "You already have a pending or approved request for this society.",
      });
    }

    // Create new request
    const request = await JoinRequest.create({
      user_id: userId,
      society_id: societyId,
      status: "pending",
      requested_at: new Date(),
    });

    res.status(201).json({ message: "Join request sent", request });
  } catch (err) {
    console.error("Join request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
