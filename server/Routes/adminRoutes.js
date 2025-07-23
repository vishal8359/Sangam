import express from "express";
import { loginAdmin, approveJoinRequest, rejectJoinRequest } from "../Controllers/adminController.js";
import { getPendingUsers } from "../Controllers/approveController.js";
import { verifyAdmin, verifyUser, verifyUserOrAdmin } from "../Middlewares/authMiddleware.js";
import { getSocietyById } from "../Controllers/societyController.js";
import { createPoll, getPollsBySociety, voteInPoll, getPollResults, togglePollLock } from "../Controllers/pollController.js";
import { createNotice, getNoticesBySociety } from "../Controllers/noticeController.js";
import { createBuzzGroup, getSocietyMembers } from "../Controllers/buzzController.js";
import upload from "../Configs/multer.js";
import { resolveComplaint, getComplaintsBySociety, getResolvedComplaints, deleteComplaint, addComplaintReply } from "../Controllers/complaintController.js";
import { getNeighbouringSocieties } from "../Controllers/societyController.js";
import { getEvents } from "../Controllers/eventController.js";
import { getMyChats, sendMessage } from "../Controllers/chatsController.js";
import { markTopContributor } from "../Controllers/contributorController.js";
import { upsertSocietyIntegration } from "../Controllers/integrationController.js";


const router = express.Router();

// first login admin and generate a token
router.post("/login", loginAdmin);
router.get("/society/:id/details", verifyUserOrAdmin, getSocietyById);

// get users who requested to join society
router.get("/pending", verifyAdmin, getPendingUsers);

// approve users
router.post("/approve-request/:requestId", verifyAdmin, approveJoinRequest);

// reject users
router.post("/reject-request/:requestId", verifyAdmin, rejectJoinRequest);

// Poll routes
router.post('/polls/create', verifyAdmin, upload.single('logo'), createPoll);
router.get("/polls/:societyId", verifyAdmin, getPollsBySociety);
router.post("/polls/vote/:pollId", verifyUser, voteInPoll);
router.get("/polls/results/:pollId", verifyUser, getPollResults);
router.patch("/polls/:pollId/lock", verifyAdmin, togglePollLock);

// Notice routes
router.post("/notices/create", verifyAdmin, createNotice);
router.get("/notices/:societyId", verifyUser, getNoticesBySociety);

//Chats
router.post("/chats/send", verifyAdmin, sendMessage);
router.get("/chats/me", verifyAdmin, getMyChats);

// Buzz group routes
router.post("/buzz/create-group", verifyAdmin, createBuzzGroup);
// routes/adminRoutes.js

// router.post("/buzz/groups/requests/:requestId/approve", verifyAdmin, approveGroupJoinRequest);
// router.post("/buzz/groups/requests/:requestId/reject", verifyAdmin, rejectGroupJoinRequest);

// Product Delete


// Complaints
router.get("/complaints/:societyId", verifyAdmin, getComplaintsBySociety);
router.put('/complaints/reply/:complaintId', verifyAdmin, addComplaintReply);
router.put("/complaints/resolve/:complaintId", verifyAdmin, resolveComplaint);
router.get("/complaints/resolved/:societyId", verifyAdmin, getResolvedComplaints);
router.delete("/complaints/:complaintId", verifyAdmin, deleteComplaint);

// Societies

router.get("/society/:id/neighbours", verifyAdmin, getNeighbouringSocieties);

router.post("/contributors/mark", verifyAdmin,markTopContributor);
// Integration
router.post(
  "/society-integration",
  verifyAdmin,
  upload.fields([
    { name: 'adminImage', maxCount: 1 },
    { name: 'mapImage', maxCount: 1 }
  ]),
  upsertSocietyIntegration
);

// events
router.get("/events", verifyAdmin, getEvents);
export default router;
