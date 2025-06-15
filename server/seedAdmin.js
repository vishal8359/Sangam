// seedAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import User from "./Models/User.js"; // adjust path if needed

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      user_id: uuidv4(),
      home_id: uuidv4(),
      name: "Admin User",
      email: "admin@example.com",
      phone_no: "1234567890",
      address: "Admin Office",
      password: hashedPassword,
      role: "admin",
      is_approved: true,
    });

    await admin.save();
    console.log("✅ Admin created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin", err);
    process.exit(1);
  }
};

seedAdmin();