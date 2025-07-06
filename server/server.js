// server.js
import express from "express";
import http from "http"; // 🆕 needed for socket
import { Server as SocketIOServer } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Configs/db.js";
import connectCloudinary from "./Configs/cloudinary.js";
import userRoutes from "./Routes/userRoute.js";
import adminRoutes from "./Routes/adminRoutes.js";

dotenv.config();
await connectDB();
await connectCloudinary();

const app = express();
const server = http.createServer(app); // 👈 create server for socket.io

// Secure CORS configuration
const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: corsOptions,
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("setup", (userId) => {
    if (!userId) return;
    socket.join(userId);
    socket.data.userId = userId;
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room`);
  });

  socket.on("send message", (msg) => {
    const { receiver } = msg;
    if (receiver) {
      io.to(receiver).emit("receive message", msg);
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    } else {
      console.log("❌ Unknown socket disconnected:", socket.id);
    }
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
