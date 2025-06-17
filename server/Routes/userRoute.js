import express from "express";
import {
  registerResident,
  createSociety,
  requestJoinSociety,
  loginUser,
} from "../Controllers/userController.js";

import { verifyUser } from "../Middlewares/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerResident);
userRoutes.post("/login", loginUser);

userRoutes.post("/society/create", verifyUser, createSociety);

userRoutes.post("/society/:id/join", verifyUser, requestJoinSociety);

export default userRoutes;
