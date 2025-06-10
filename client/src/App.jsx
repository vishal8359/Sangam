import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom"; // ✅ Added import
import DashboardLayoutBasic from "./Material/toolpad";

const App = () => {
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      <Toaster />
      <Routes>
        <Route path="/*" element={<DashboardLayoutBasic />} />
      </Routes>
    </div>
  );
};

export default App;
