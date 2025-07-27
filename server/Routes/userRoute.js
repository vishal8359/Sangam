import express from "express";
import {
  registerResident,
  createSociety,
  requestJoinSociety,
  loginUser,
  verifyOtp,
  getEventInvitations,
  getCurrentUser,
  getUserById,
  updateCurrentUserProfile,
  addDeliveryAddress,
  setDefaultDeliveryAddress,
  deleteDeliveryAddress,
  googleLogin,
} from "../Controllers/userController.js";

import {
  verifyUser,
  verifyUserOrAdmin,
} from "../Middlewares/authMiddleware.js";
import {
  getPollsBySociety,
  voteInPoll,
} from "../Controllers/pollController.js";
import { getNoticesBySociety } from "../Controllers/noticeController.js";
import {
  getMessages,
  uploadVoiceMessage,
  uploadBuzzFile,
  deleteBuzzMessageForMe,
  deleteBuzzMessageForEveryone,
  getBuzzGroups,
  createBuzzGroup,
} from "../Controllers/buzzController.js";
import upload from "../Configs/multer.js";
import { addProduct, getCartProducts, getMyProducts, getProductById, getRelatedProducts, getSellerProductsWithStats, getSocietyProducts, toggleProductActiveStatus } from "../Controllers/productController.js";
import {
  submitComplaint,
  getComplaintsBySociety,
  deleteComplaint,
} from "../Controllers/complaintController.js";

import { addHelpService, getHelpServices, getNeighbourHomes } from "../Controllers/getNeighbourHomes.js";
import {
  getNeighbouringSocieties,
  getSocietyById,
} from "../Controllers/societyController.js";

import {
  createEvent,
  getEvents,
  getSocietyMembers,
  inviteToEvent,
} from "../Controllers/eventController.js";
import {
  deleteMessage,
  getChatHistory,
  getMyChats,
  getSocietyUsers,
  sendMessage,
  uploadChatFile,
} from "../Controllers/chatsController.js";
import { createOrder, getMyOrders, getSellerOrders } from "../Controllers/orderController.js";
import { addComment, addReply, deleteReelById, getAllReels, getEngagementStats, getReelsByUserId, getUserReelStats, incrementView, likeReel, sendReelToChatOrGroup, shareReel, toggleFollowUser, uploadReel } from "../Controllers/galleryController.js";
import { getTopContributors } from "../Controllers/contributorController.js";
import { addHealth, deleteHealthData, getHealth } from "../Controllers/addHealthController.js";
import { getSocietyIntegration } from "../Controllers/integrationController.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../Controllers/paymentController.js";


const router = express.Router();
// first register
router.post("/register", upload.single('avatar'), registerResident);
//send OTP
router.post("/verify-otp", verifyOtp);
// login
router.post("/login", loginUser);
router.post("/google-login", googleLogin);


router.post("/society/create", createSociety);

router.post("/society/:id/join", verifyUser, requestJoinSociety);
router.get("/society/:id/details", verifyUserOrAdmin, getSocietyById);
router.patch("/profile/me", verifyUser, upload.single("avatar"), updateCurrentUserProfile);


// Polls
router.get("/polls/:societyId", verifyUser, getPollsBySociety);
router.post("/polls/:pollId/vote", verifyUser, voteInPoll);

// Notices
router.get("/notices/:societyId", verifyUser, getNoticesBySociety);

// Chats
router.post("/chats/send", verifyUser, sendMessage);
router.get("/chats/me", verifyUser, getMyChats);
router.get("/society/:societyId/users", verifyUser, getSocietyUsers);
router.get("/chats/:userId/:peerId", getChatHistory);
router.post("/chats/upload", verifyUser, upload.single("file"), uploadChatFile);
router.delete("/chats/:id", verifyUserOrAdmin, deleteMessage);

// Buzz groups
router.get("/buzz/message/:societyId", verifyUser, getMessages);
router.post(
  "/buzz/upload/voice",
  verifyUser,
  upload.single("audio"),
  uploadVoiceMessage
);
router.post("/buzz/create-group", verifyUser, createBuzzGroup);
router.get("/buzz/members/:societyId", verifyUser, getSocietyMembers);

router.get("/buzz/groups/:societyId", getBuzzGroups);
router.delete("/buzz/message/:messageId/me", verifyUser, deleteBuzzMessageForMe);
router.delete("/buzz/message/:messageId/all", verifyUser, deleteBuzzMessageForEveryone);

router.post("/buzz/upload", verifyUser, upload.single("file"), uploadBuzzFile);


// products
router.post("/add", verifyUser, upload.array("images", 4), addProduct);
router.get("/products/mine", verifyUser, getMyProducts);
// router.get("/products/society", verifyUser, getSocietyProducts);
router.post("/products/cart", verifyUser, getCartProducts);
router.patch(
  "/products/:id/toggle",
  verifyUser, 
  toggleProductActiveStatus
);
router.post("/razorpay/create-order", verifyUser, createRazorpayOrder);
router.post("/razorpay/verify-payment", verifyUser, verifyRazorpayPayment);
router.post("/me/address/add", verifyUser, addDeliveryAddress);
router.put("/me/delivery-address/default", verifyUser, setDefaultDeliveryAddress);
router.delete("/me/delivery-address/:addressId", verifyUser, deleteDeliveryAddress);
router.post("/order/create", verifyUser, createOrder);
router.get("/order/seller", verifyUser, getSellerOrders);
router.get("/order/my-orders", verifyUser, getMyOrders);
router.get("/products/stats", verifyUser, getSellerProductsWithStats);
router.get("/products/:id", getProductById);
router.get("/products", verifyUser, getSocietyProducts);
// Complaint

router.post(
  "/complaints/submit",
  verifyUser,
  upload.single("file"),
  submitComplaint
);
router.delete("/complaints/:complaintId", verifyUser, deleteComplaint);
router.get(
  "/complaints/society/:societyId",
  verifyUser,
  getComplaintsBySociety
);

// Events
router.post("/events/create", verifyUser, upload.single("image"), createEvent);
router.get("/members", verifyUser, getSocietyMembers);
router.post("/events/invite", verifyUser, inviteToEvent);
router.get("/events", verifyUser, getEvents);
router.get("/events/invitations", verifyUser, getEventInvitations);
router.get("/me", verifyUser, getCurrentUser);

// Neighbours
router.get("/homes/neighbours", verifyUser, getNeighbourHomes);
router.get("/help-services", verifyUser, getHelpServices);
router.post("/addServices", verifyUser, addHelpService);
// societies
router.get("/neighbouring-societies", verifyUser, getNeighbouringSocieties);

// Reels
router.post("/gallery/reels/upload", verifyUser, upload.single("video"), uploadReel);
router.put("/gallery/reels/:reelId/like", verifyUser, likeReel);
router.post("/gallery/reels/:reelId/comment", verifyUser, addComment);
router.post("/gallery/reels/:reelId/comment/:commentIndex/reply", verifyUser, addReply);
router.put("/gallery/reels/:reelId/view", verifyUser, incrementView);
router.get("/gallery/reels/engagement", verifyUser, getEngagementStats);
router.get("/:userId/reel-stats", verifyUser, getUserReelStats);
router.get("/user/:id/reels", verifyUser, getReelsByUserId);
router.delete("/gallery/reels/:reelId", verifyUser, deleteReelById);
router.get("/gallery/reels", getAllReels);
router.put("/user/:id/follow", verifyUser, toggleFollowUser);
router.post(
  "/gallery/reels/:reelId/share",
  verifyUser,
  shareReel
);
router.post("/gallery/reels/send", verifyUser, sendReelToChatOrGroup);


router.get("/user/:id", verifyUser, getUserById);

router.get("/contributors/all", verifyUser, getTopContributors);

// health

router.post("/addhealth", verifyUser, addHealth);
router.get("/gethealth", verifyUser, getHealth);
router.delete("/health/:id", verifyUser, deleteHealthData);

// Integration
router.get("/society-integration", verifyUser, getSocietyIntegration);

export default router;