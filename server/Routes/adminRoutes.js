import express from "express";
import { loginAdmin, approveJoinRequest, rejectJoinRequest } from "../Controllers/adminController.js";
import { approveResident, getPendingUsers } from "../Controllers/approveController.js";
import { verifyAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/pending", verifyAdmin, getPendingUsers);
router.post("/login", loginAdmin);
router.post("/approve/:userId", verifyAdmin, approveResident);

router.post("/approve-request/:requestId", verifyAdmin, approveJoinRequest);
router.post("/reject-request/:requestId", verifyAdmin, rejectJoinRequest);


export default router;
