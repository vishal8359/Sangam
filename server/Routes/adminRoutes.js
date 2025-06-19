import express from "express";
import { loginAdmin, approveJoinRequest, rejectJoinRequest } from "../Controllers/adminController.js";
import { approveResident, getPendingUsers } from "../Controllers/approveController.js";
import { verifyAdmin, verifyUser } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// first login admin and generate a token
router.post("/login", loginAdmin);

// get users who requested to join society
router.get("/pending", verifyAdmin, getPendingUsers);

// approve users
router.post("/approve-request/:requestId", verifyAdmin, approveJoinRequest);

// reject users
router.post("/reject-request/:requestId", verifyAdmin, rejectJoinRequest);


export default router;
