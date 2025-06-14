import express from "express";
import { loginAdmin } from "../Controllers/adminController.js";
import { approveResident } from "../Controllers/approveController.js";
import { verifyAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/approve/:userId", verifyAdmin, approveResident);

export default router;
