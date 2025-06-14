import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom"; // ✅ Added import
import DashboardLayoutBasic from "./Material/toolpad";
import MySociety from "./pages/MySociety";
import ResidentLogin from "./pages/ResidentLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import HomePage from "./pages/Initial";

const App = () => {
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/resident-login" element={<ResidentLogin/>} />
        <Route path="admin-login" element={<AdminLogin/>}/>
        <Route path="register" element={<Register/>} />
        <Route path="/*" element={<DashboardLayoutBasic />} />
      </Routes>
    </div>
  );
};

export default App;
