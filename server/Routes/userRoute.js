import express from "express";
import { registerResident } from "../Controllers/userController.js";

const userRoutes = express.Router();
userRoutes.post("/register", registerResident);

export default userRoutes;
