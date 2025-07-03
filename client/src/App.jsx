import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom"; // ✅ Added import
import DashboardLayoutBasic from "./Material/toolpad";
import MySociety from "./pages/Society/MySociety";
import ResidentLogin from "./pages/Auth/ResidentLogin";
import AdminLogin from "./pages/Auth/AdminLogin";
import Register from "./pages/Auth/Register";
import HomePage from "./pages/Initial";
import Products from "./pages/Reports/Products";
import UploadReelPage from "./pages/Gallery/uploadReelPage";
import ScrollReelsPage from "./pages/Gallery/scrollReelsPage";
import UploadImagePage from "./pages/Gallery/uploadImagePage";
import ImagesGalleryPage from "./pages/Gallery/imagesPage";
import ChatsPage from "./pages/Chats/Chats";
import CartPage from "./pages/Products/cartPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import AddAddress from "./pages/Products/AddAddress";
import UserProfileCard from "./pages/Society/UserProfile";
import InviteMembersPage from "./pages/Events/SendInvitePage";
import ViewInvitations from "./pages/Events/ViewInvitationPage";

import CreatePollPage from "./pages/Polls/createPollPage";
import SubmitComplaint from "./pages/Complaints/RegisterComplaint";
import UploadNoticePage from "./pages/Notices/UploadNotice";
import CreateSociety from "./pages/Society/CreateSoc";
import VerifyOtp from "./pages/Auth/VerifyOTP";
import ApprovalPanel from "./pages/Society/AprrovalPanel";

const App = () => {
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/my-society/chats" element={<ChatsPage/>}/> */}
        <Route path="/resident-login" element={<ResidentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/create-society" element={<CreateSociety />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gallery/upload-reel" element={<UploadReelPage />} />
        <Route path="/gallery/reels" element={<ScrollReelsPage />} />
        <Route path="/gallery/upload-image" element={<UploadImagePage />} />
        <Route path="/gallery/images" element={<ImagesGalleryPage />} />
        <Route path="/reports/products" element={<Products />} />
        <Route path="/my-society/ads/cart" element={<CartPage />} />
        <Route
          path="/my-society/ads/:product_id/product_detail"
          element={<ProductDetailPage />}
        />
        <Route path="/my-society/ads/add-address" element={<AddAddress />} />
        {/* <Route path="/user" element={<UserProfileCard/>}/> */}
        <Route
          path="/my-society/events/send_invites/:eventId"
          element={<InviteMembersPage />}
        />

        <Route
          path="/my-society/events/view_invitations"
          element={<ViewInvitations />}
        />
        <Route path="/my-society/polls/create" element={<CreatePollPage />} />
        <Route
          path="/my-society/complaints/new"
          element={<SubmitComplaint />}
        />
        <Route path="/my-society/notices/new" element={<UploadNoticePage />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="my-society/admin/panel" element={<ApprovalPanel />} />
        <Route path="/*" element={<DashboardLayoutBasic />} />
      </Routes>
    </div>
  );
};

export default App;
