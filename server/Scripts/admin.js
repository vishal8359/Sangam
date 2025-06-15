// scripts/createAdmin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../Models/User.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const hashedPassword = await bcrypt.hash("admin123", 10);

await User.create({
  name: "Admin",
  email: "admin@example.com",
  password: hashedPassword,
  phone_no: "9999999999",
  address: "Admin Office",
  role: "admin",
  is_approved: true,
});

console.log("✅ Admin created");
process.exit();
