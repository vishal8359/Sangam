import express from "express";
import { loginAdmin, approveJoinRequest, rejectJoinRequest } from "../Controllers/adminController.js";
import { approveResident, getPendingUsers } from "../Controllers/approveController.js";
import { verifyAdmin, verifyUser } from "../Middlewares/authMiddleware.js";

import { createPoll, getPollsBySociety, voteInPoll, getPollResults } from "../Controllers/pollController.js";
import { createNotice, getNoticesBySociety } from "../Controllers/noticeController.js";
import { createGroup, getGroupsBySociety, getGroupDetails, postInGroup } from "../Controllers/buzzController.js";
const router = express.Router();

// first login admin and generate a token
router.post("/login", loginAdmin);

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

// Notice routes
router.post("/notices/create", verifyAdmin, createNotice);
router.get("/notices/:societyId", verifyUser, getNoticesBySociety);

// Buzz group routes
router.post("/buzz/groups/create", verifyAdmin, createGroup);
router.get("/buzz/groups/:societyId", verifyUser, getGroupsBySociety);
router.get("/buzz/group/:groupId", verifyUser, getGroupDetails);
router.post("/buzz/group/:groupId/post", verifyUser, postInGroup);

export default router;
