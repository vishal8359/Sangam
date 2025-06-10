import React from 'react';
import { society } from '../assets/local.js';
import societyBg from '../assets/societyBg.jpg';
import MySocietyImg from '../assets/mySocietyImg.jpg';
import society_icon from '../assets/society_icon.png';
import { useNavigate } from "react-router-dom";

const MySociety = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* Background Image with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{
          backgroundImage: `url(${societyBg})`,
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <div
        className="relative max-w-5xl w-full mx-auto mt-5 p-10 bg-white bg-opacity-90 rounded-2xl shadow-xl"
        style={{ zIndex: 1 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2 flex justify-center gap-4">
          <img className="w-10 h-10 pb-1" src={society_icon} alt="img" /> My Society
        </h1>

        <div className="flex justify-center mb-6">
          <img
            src={MySocietyImg}
            alt={`${society.name} Image`}
            className="rounded-xl shadow-md max-h-48 object-cover"
          />
        </div>

        <div className="grid gap-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Society Name:</span>
            <span>{society.name}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Society ID:</span>
            <span>{society.id}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Address:</span>
            <span>{society.address}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Members Joined:</span>
            <span>{society.members}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Admin:</span>
            <span>{society.admin}</span>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="mt-6 flex flex-col items-center space-y-4">
          {/* Leave Button */}
          <button
            style={{
              cursor: "pointer",
              backgroundColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-primary-dull)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-primary)')
            }
            className="text-white px-6 py-2 rounded-xl transition w-48"
          >
            Leave Society
          </button>

          {/* Resident Login */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition w-48 cursor-pointer"
            onClick={() => navigate('resident-login')}
          >
            Resident Login
          </button>

          {/* Admin Login */}
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition w-48 cursor-pointer"
             onClick={() => navigate('admin-login')}
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default MySociety;
