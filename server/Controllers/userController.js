import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import Society from "../Models/Society.js";
import JoinRequest from "../Models/JoinRequest.js";
import Home from "../Models/Home.js";
import sendSMS from "../Utils/smsService.js";
import { extractSortOrder } from "./getNeighbourHomes.js";
import mongoose from "mongoose";
import Invitation from "../Models/Invitation.js";
const pendingRegistrations = new Map();

// Register without society_id
export const registerResident = async (req, res) => {
  try {
    const {
      user_name,
      email,
      phone_no,
      address,
      password,
      confirm_password,
      electricity_bill_no,
      avatar,
    } = req.body;

    if (
      !user_name ||
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

    const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    pendingRegistrations.set(phone_no, {
      user_name,
      email,
      address,
      password,
      electricity_bill_no,
      otp,
      otpExpiry,
      avatar,
    });

    await sendSMS(
      phone_no,
      `🔐 Your OTP for society registration is: ${otp}. Valid for 5 minutes.`
    );

    return res.status(200).json({ message: "OTP sent for verification" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// OTP Verification (No society linked yet)
export const verifyOtp = async (req, res) => {
  const { phone_no, otp } = req.body;

  try {
    const pendingData = pendingRegistrations.get(phone_no);

    if (!pendingData) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    if (pendingData.otp !== otp || Date.now() > pendingData.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(pendingData.password, 10);
    const [houseNumber, ...rest] = pendingData.address.split(",");
    const street = rest.join(",").trim();

    let home = await Home.findOne({
      electricity_bill_no: pendingData.electricity_bill_no,
      street,
      houseNumber: houseNumber.trim(),
    });

    if (!home) {
      home = await Home.create({
        electricity_bill_no: pendingData.electricity_bill_no,
        street,
        houseNumber: houseNumber.trim(),
        houseSortOrder: extractSortOrder(houseNumber),
        residents: [],
      });
    }

    const newUser = await User.create({
      user_id: uuidv4(),
      name: pendingData.user_name,
      email: pendingData.email,
      phone_no,
      address: pendingData.address,
      password: hashedPassword,
      home_id: home._id,
      is_verified: true,
      is_approved: false,
      roles: [],
      avatar: pendingData.avatar || "",
    });

    home.residents.push(newUser._id);
    await home.save();

    pendingRegistrations.delete(phone_no);

    await sendSMS(
      phone_no,
      `✅ Registration complete! Hello ${newUser.name}, your User ID is: ${newUser.user_id} \nHome ID: ${home._id}\nPlease login with your Society ID to complete joining.`
    );

    res.status(201).json({
      message: "User created. Login with your Society ID to request joining.",
      user_id: newUser.user_id,
      home_id: home._id,
    });
  } catch (err) {
    console.error("❌ OTP Verification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login with society_id and user_id (also triggers joinRequest if needed)
export const loginUser = async (req, res) => {
  const { user_id, password, society_id } = req.body;

  if (!user_id || !password || !society_id) {
    return res.status(400).json({
      success: false,
      message: "User ID, Society ID, and Password are required.",
    });
  }

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const society = await Society.findById(society_id);
    if (!society) {
      return res.status(400).json({
        success: false,
        message: "Invalid Society ID.",
      });
    }

    // ADD THIS LOGIC *AFTER* credentials are validated:
    const hasRole = user.roles.some(
      (r) => r.role === "resident" && r.society_id.toString() === society_id
    );

    // PENDING USERS
    if (!hasRole || !user.is_approved) {
      const existing = await JoinRequest.findOne({
        user_id: user._id,
        society_id,
        status: { $in: ["pending", "approved"] },
      });

      if (!existing) {
        await JoinRequest.create({
          user_id: user._id,
          society_id,
          status: "pending",
          requested_at: new Date(),
        });
      }

      return res.status(403).json({
        success: false,
        message: "Join request sent for approval.",
      });
    }

    // Approved user: allow login
    const token = jwt.sign(
      { id: user._id, role: "resident" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      userId: user.user_id,
      houseId: user.home_id?.toString() || "", 
      societyId: society_id,
      userRole: "resident",
      userProfile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// POST : /api/society/create
export const createSociety = async (req, res) => {
  try {
    const { name, house, contact, email, password, location } = req.body;

    if (!name || !house || !contact || !password || !location) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let user = await User.findOne({ phone_no: contact });
    let isNewUser = false;

    const [houseNumber, ...rest] = house.split(",");
    const street = rest.join(",").trim();

    // Create Home first
    const newHome = await Home.create({
      electricity_bill_no: "N/A-" + uuidv4().split("-")[0],
      houseNumber: houseNumber.trim(),
      street,
      houseSortOrder: extractSortOrder(houseNumber),
      residents: [], // Add user later
    });

    if (!user) {
      // Create user with home_id assigned
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        user_id: uuidv4().split("-")[0],
        name,
        email,
        phone_no: contact,
        password: hashedPassword,
        address: house,
        is_approved: true,
        is_verified: true,
        roles: [],
        home_id: newHome._id,
      });

      await user.save();
      isNewUser = true;
    } else {
      // Existing user: assign new home_id
      user.home_id = newHome._id;
      await user.save();
    }

    // Add user to the home
    newHome.residents.push(user._id);
    await newHome.save();

    // Create Society
    const newSociety = await Society.create({
      name: `${name}'s Society`,
      location,
      created_by: user._id,
      residents: [user._id],
    });

    // Assign admin role
    user.roles.push({ society_id: newSociety._id, role: "admin" });
    user.created_society = newSociety._id;
    await user.save();

    await sendSMS(
      contact,
      `🎉 Society Created!
Admin: ${user.name}
🆔 User ID: ${user.user_id}
🏠 Home ID: ${newHome._id}
🔑 Use your password to login.`
    );

    return res.status(201).json({
      message: "Society created successfully.",
      society_id: newSociety._id,
      user_id: user.user_id,
      home_id: newHome._id,
    });
  } catch (err) {
    console.error("❌ Society creation error:", err);
    return res
      .status(500)
      .json({ message: "Server error during society creation" });
  }
};

// POST : /api/society/:id/join
export const requestJoinSociety = async (req, res) => {
  try {
    const userId = req.user._id;
    const societyId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(societyId)) {
      return res.status(400).json({ message: "Invalid society ID." });
    }

    // Check if society exists
    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ message: "Society not found." });
    }

    // Check for duplicate pending/approved request
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

    // Create request
    const request = await JoinRequest.create({
      user_id: userId,
      society_id: societyId,
      status: "pending",
      requested_at: new Date(),
    });

    res.status(201).json({ message: "Join request sent", request });
  } catch (err) {
    console.error("❌ Join request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getEventInvitations = async (req, res) => {
  try {
    const userId = req.user._id;

    const invitations = await Invitation.find({ invitedUser: userId })
      .populate("event") // populate the event details
      .populate("invitedBy", "name"); // optional: who invited

    res.status(200).json({ invitations });
  } catch (err) {
    console.error("Failed to fetch invitations:", err);
    res.status(500).json({ message: "Failed to get invitations" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user; // This comes from verifyUser middleware
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get Current User Error:", err);
    res.status(500).json({ message: "Failed to fetch current user" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "_id") // just count, not full data
      .select("name avatar address followers"); // only what's needed

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};