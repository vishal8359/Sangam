import express from "express";
import {
  registerResident,
  createSociety,
  requestJoinSociety,
  loginUser,
  verifyOtp,
} from "../Controllers/userController.js";

import { verifyUser } from "../Middlewares/authMiddleware.js";
import { getPollsBySociety, voteInPoll } from "../Controllers/pollController.js";
import { getNoticesBySociety } from "../Controllers/noticeController.js";
import { getGroupsBySociety, getGroupDetails, postInGroup } from "../Controllers/buzzController.js";
import upload from "../Configs/multer.js";
import { requestToJoinGroup } from "../Controllers/groupJoinController.js";
const router = express.Router();
import { createProduct, getActiveProducts, deleteProduct } from "../Controllers/productController.js";
import { submitComplaint, getComplaintsBySociety, deleteComplaint } from "../Controllers/complaintController.js";
import { createEvent, getAllEvents, cancelEvent, rsvpToEvent, commentOnEvent } from "../Controllers/eventController.js";
import {getNeighbourHomes} from "../Controllers/getNeighbourHomes.js";
import { getNeighbouringSocieties, getSocietyById } from "../Controllers/societyController.js";
import { getReelEngagement } from "../Controllers/reelEngagementController.js";

import {
  uploadReel,
  getAllReels,
  likeReel,
  addComment,
  addReply,
  uploadImage,
  getSocietyImages,
} from "../Controllers/galleryController.js";

// first register
router.post("/register", registerResident);
//send OTP
router.post("/verify-otp", verifyOtp);
// login
router.post("/login", loginUser);

router.post("/society/create", createSociety);

router.post("/society/:id/join", verifyUser, requestJoinSociety);
router.get("/society/:id/details", verifyUser, getSocietyById);
// Polls
router.get("/polls/:societyId", verifyUser, getPollsBySociety);
router.post("/polls/:pollId/vote", verifyUser, voteInPoll);

// Notices
router.get("/notices/:societyId", verifyUser, getNoticesBySociety);

// Buzz groups
router.get("/buzz/groups/:societyId", verifyUser, getGroupsBySociety);
router.get("/buzz/group/:groupId", verifyUser, getGroupDetails);
router.post(
  "/buzz/groups/:groupId/post",
  verifyUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "reel", maxCount: 1 },
  ]),
  postInGroup
);
router.post("/buzz/groups/:groupId/join-request", verifyUser, requestToJoinGroup);

// products
router.post(
  "/products/create",
  verifyUser,
  upload.array("images", 5),
  createProduct
);
router.get("/products", verifyUser, getActiveProducts);
router.delete("/products/:productId", verifyUser, deleteProduct);

// Complaint

router.post(
  "/complaints/submit",
  verifyUser,
  upload.single("file"),
  submitComplaint
);
router.delete("/complaints/:complaintId", verifyUser, deleteComplaint);
router.get("/complaints/society/:societyId", verifyUser, getComplaintsBySociety);

// Events
router.post("/create-events", verifyUser, upload.single("image"), createEvent);
router.patch("/events/:eventId/cancel", verifyUser, cancelEvent);
router.get("/events", verifyUser, getAllEvents);
router.post("/events/:eventId/rsvp", verifyUser, rsvpToEvent);
router.post("/events/:eventId/comment", verifyUser, commentOnEvent);

// Neighbours
router.get("/homes/neighbours", verifyUser, getNeighbourHomes);

// societies
router.get("/society/:id/neighbours/", verifyUser, getNeighbouringSocieties);


// Reels
router.post("/gallery/reels", verifyUser, upload.single("video"), uploadReel);
router.get("/gallery/reels", verifyUser, getAllReels);
router.put("/gallery/reels/:reelId/like", verifyUser, likeReel);
router.post("/gallery/reels/:reelId/comment", verifyUser, addComment);
router.post("/gallery/reels/:reelId/comment/:commentIndex/reply", verifyUser, addReply);
router.get("/gallery/reels/engagement", verifyUser, getReelEngagement);

// Images
router.post("/gallery/image", verifyUser, upload.single("image"), uploadImage);
router.get("/gallery/image", verifyUser, getSocietyImages);

export default router;