import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Configs/db.js";
import connectCloudinary from "./Configs/cloudinary.js";
import userRoutes from "./Routes/userRoute.js";
import adminRoutes from "./Routes/adminRoutes.js";
import Chats from "./Models/Chats.js";
import User from "./Models/User.js"; // Required for online status map
import { registerBuzzHandlers } from "./Controllers/buzzController.js";

dotenv.config();
await connectDB();
await connectCloudinary();

const app = express();
const server = http.createServer(app);

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

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

const io = new SocketIOServer(server, {
  cors: corsOptions,
});
app.set("socketio", io);
const onlineUsers = new Map();

async function broadcastOnlineStatus() {
  try {
    const users = await User.find({}, "_id isOnline lastSeen");

    const statusMap = {};
    for (const user of users) {
      statusMap[user._id] = {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen || null,
      };
    }

    io.emit("online status", statusMap); // ✅ Broadcast to all clients
  } catch (err) {
    console.error("Failed to broadcast status:", err);
  }
}

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  registerBuzzHandlers(io, socket);
  socket.on("setup", async (userId) => {
    if (!userId) return;

    socket.join(userId);
    socket.data.userId = userId;
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room`);

    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Send online status map immediately to newly connected client
      const users = await User.find({}, "_id isOnline lastSeen");
      const statusMap = {};
      for (const user of users) {
        statusMap[user._id] = {
          isOnline: user.isOnline,
          lastSeen: user.lastSeen || null,
        };
      }

      socket.emit("online status", statusMap); // Only to that socket
      await broadcastOnlineStatus(); // Notify others this user is online
    } catch (err) {
      console.error("Failed during setup:", err);
    }
  });

  socket.on("send message", (msg) => {
    const { receiver } = msg;
    if (receiver) {
      io.to(receiver).emit("receive message", msg);
    }
  });

  socket.on("mark as seen", async ({ userId, peerId }) => {
    console.log("Marking messages seen:", { userId, peerId });

    try {
      await Chats.updateMany(
        { sender: peerId, receiver: userId, seen: false },
        { $set: { seen: true } }
      );

      io.to(peerId.toString()).emit("messages seen", { from: userId });
    } catch (err) {
      console.error("Error marking messages as seen:", err);
    }
  });

  socket.on("delete message", ({ messageId, receiver }) => {
    if (receiver) {
      io.to(receiver).emit("delete message", { messageId });
    }
  });
  
  socket.on("disconnect", async () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      console.log(` User ${userId} disconnected`);

      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        await broadcastOnlineStatus();
      } catch (err) {
        console.error("Error marking user offline:", err);
      }
    } else {
      console.log("Unknown socket disconnected:", socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
