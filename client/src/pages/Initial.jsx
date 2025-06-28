import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import sangamLogo from '/appLogo.png'; 
import { useAppContext } from '../context/AppContext';

export default function HomePage() {
  const {navigate} = useAppContext();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      {/* Background Blurred Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400 opacity-30 rounded-full filter blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300 opacity-30 rounded-full filter blur-3xl animate-ping z-0"></div>

      {/* Card Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center"
      >
        <img
          src={sangamLogo}
          alt="Sangam Logo"
          className="mx-auto mb-4 h-24 w-24 object-contain"
        />
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Welcome to Sangam App
        </h1>
        <p className="text-gray-600 mb-6 italic">
          Your gateway to efficient community management
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/resident-login')}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-300 cursor-pointer"
          >
            Residents Login
          </button>
          <button
            onClick={() => navigate('/admin-login')}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-300 cursor-pointer"
          >
            Admin Login
          </button>
          <button
            onClick={() => navigate('/create-society')}
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition duration-300 cursor-pointer"
          >
            Create New Society
          </button>
        </div>
      </motion.div>
    </div>
  );
}
