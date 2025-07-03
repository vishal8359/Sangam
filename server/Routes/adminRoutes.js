import express from "express";
import { loginAdmin, approveJoinRequest, rejectJoinRequest } from "../Controllers/adminController.js";
import { getPendingUsers } from "../Controllers/approveController.js";
import { verifyAdmin, verifyUser, verifyUserOrAdmin } from "../Middlewares/authMiddleware.js";
import { getSocietyById } from "../Controllers/societyController.js";
import { createPoll, getPollsBySociety, voteInPoll, getPollResults, togglePollLock } from "../Controllers/pollController.js";
import { createNotice, getNoticesBySociety } from "../Controllers/noticeController.js";
import { createGroup, getGroupsBySociety, getGroupDetails, postInGroup } from "../Controllers/buzzController.js";
import { rejectGroupJoinRequest, approveGroupJoinRequest } from "../Controllers/groupJoinController.js";
import { deactivateProduct } from "../Controllers/productController.js";
import { resolveComplaint, getComplaintsBySociety, getResolvedComplaints, deleteComplaint } from "../Controllers/complaintController.js";
import { getNeighbouringSocieties } from "../Controllers/societyController.js";
import { getEvents } from "../Controllers/eventController.js";

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
router.post("/polls/create", verifyAdmin, createPoll);
router.get("/polls/:societyId", verifyAdmin, getPollsBySociety);
router.post("/polls/vote/:pollId", verifyUser, voteInPoll);
router.get("/polls/results/:pollId", verifyUser, getPollResults);
router.patch("/polls/:pollId/lock", verifyAdmin, togglePollLock);

// Notice routes
router.post("/notices/create", verifyAdmin, createNotice);
router.get("/notices/:societyId", verifyUser, getNoticesBySociety);

// Buzz group routes
router.post("/buzz/groups/create", verifyAdmin, createGroup);
router.get("/buzz/groups/:societyId", verifyUser, getGroupsBySociety);
router.get("/buzz/group/:groupId", verifyUser, getGroupDetails);
router.post("/buzz/group/:groupId/post", verifyUser, postInGroup);
router.post("/buzz/groups/requests/:requestId/approve", verifyAdmin, approveGroupJoinRequest);
router.post("/buzz/groups/requests/:requestId/reject", verifyAdmin, rejectGroupJoinRequest);

// Product Delete
router.put("/products/:productId/deactivate", verifyAdmin, deactivateProduct);

// Complaints
router.get("/complaints/:societyId", verifyAdmin, getComplaintsBySociety);
router.put("/complaints/resolve/:complaintId", verifyAdmin, resolveComplaint);
router.get("/complaints/resolved/:societyId", verifyAdmin, getResolvedComplaints);
router.delete("/complaints/:complaintId", verifyAdmin, deleteComplaint);

// Societies

router.get("/society/:id/neighbours", verifyAdmin, getNeighbouringSocieties);

// events
router.get("/events", verifyAdmin, getEvents);
export default router;
