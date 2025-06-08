import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import { Toaster } from 'react-hot-toast';
import MySociety from './pages/MySociety';
import ChatsPage from './pages/Chats';
import AdminLogin from './pages/AdminLogin';
import ResidentLogin from './pages/ResidentLogin';
// import { useLocation } from 'react-router-dom';
const App = () => {
  const location = useLocation();
  console.log("Current path:", location.pathname);
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      <Navbar />
      <Toaster />

      <Routes>
        <Route path="/" element={<MySociety />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/resident-login" element={<ResidentLogin />} />
        
      </Routes>
    </div>
  );
};

export default App;
