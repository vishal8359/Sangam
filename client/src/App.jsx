import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom"; // ✅ Added import
import DashboardLayoutBasic from "./Material/toolpad";
import MySociety from "./pages/MySociety";
import ResidentLogin from "./pages/ResidentLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import HomePage from "./pages/Initial";
import Products from "./pages/Reports/Products"
import UploadReelPage from "./pages/Gallery/uploadReelPage";
import ScrollReelsPage from "./pages/Gallery/scrollReelsPage";
import UploadImagePage from "./pages/Gallery/uploadImagePage";
import ImagesGalleryPage from "./pages/Gallery/imagesPage";
import ChatsPage from "./pages/Chats/Chats";
import CartPage from "./pages/Products/cartPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import AddAddress from "./pages/Products/AddAddress";
import UserProfileCard from "./pages/UserProfile";
import InviteMembersPage from "./pages/Events/SendInvitePage";
import ViewInvitations from "./pages/Events/ViewInvitationPage";


import CreatePollPage from "./pages/Polls/createPollPage";
import SubmitComplaint from "./pages/Complaints/RegisterComplaint";
import UploadNoticePage from "./pages/Notices/UploadNotice";
import CreateSociety from "./pages/CreateSoc";

const App = () => {
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        {/* <Route path="/my-society/chats" element={<ChatsPage/>}/> */}
        <Route path="/resident-login" element={<ResidentLogin/>} />
        <Route path="/admin-login" element={<AdminLogin/>}/>
        <Route path="/create-society" element={<CreateSociety/>}/>
        <Route path="/register" element={<Register/>} />
        <Route path="/*" element={<DashboardLayoutBasic />} />
        <Route path="/gallery/upload-reel" element={<UploadReelPage />} />
        <Route path="/gallery/reels" element={<ScrollReelsPage />} />
        <Route path="/gallery/upload-image" element={<UploadImagePage />} />
        <Route path="/gallery/images" element={<ImagesGalleryPage />} />
        <Route path="/reports/products" element={<Products/>} />
        <Route path="/my-society/ads/cart" element={<CartPage/>}/>
        <Route path='/my-society/ads/:product_id/product_detail' element={<ProductDetailPage/>}/>
        <Route path="/my-society/ads/add-address" element={<AddAddress/>} />
        {/* <Route path="/user" element={<UserProfileCard/>}/> */}
        <Route path="/my-society/events/send_invites" element={<InviteMembersPage />} />
        <Route path="/my-society/events/view_invitations" element={<ViewInvitations />} />
        <Route path="/my-society/polls/create" element={<CreatePollPage/>}/>
        <Route path="/my-society/complaints/new" element={<SubmitComplaint/>}/>
        <Route path="/my-society/notices/new" element={<UploadNoticePage/>}/>
      </Routes>
    </div>
  );
};

export default App;
