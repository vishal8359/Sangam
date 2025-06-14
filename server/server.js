// server.js (or server.mjs if not using "type": "module")
import cookieParser from 'cookie-parser'
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Configs/db.js";
import connectCloudinary from "./Configs/cloudinary.js";

dotenv.config();
await connectDB();
await connectCloudinary();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Routes (uncomment after creating route files)
// import residentRoutes from "./routes/residentRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// app.use("/api/residents", residentRoutes);
// app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
