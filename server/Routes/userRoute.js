import express from "express";
import {
  registerResident,
  createSociety,
  requestJoinSociety,
  loginUser,
  verifyOtp,
} from "../Controllers/userController.js";

import { verifyUser } from "../Middlewares/authMiddleware.js";

const userRoutes = express.Router();

// first register
userRoutes.post("/register", registerResident);
//send OTP
userRoutes.post("/verify-otp", verifyOtp);
// login
userRoutes.post("/login", loginUser);

userRoutes.post("/society/create", verifyUser, createSociety);

userRoutes.post("/society/:id/join", verifyUser, requestJoinSociety);

export default userRoutes;
