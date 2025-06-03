import React from 'react';
import { society } from '../assets/local.js';
import societyBg from '../assets/societyBg.jpg';
import MySocietyImg from '../assets/mySocietyImg.jpg';
const MySociety = () => {

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

      {/* Overlay to darken the image slightly */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div
        className="relative max-w-3xl w-full mx-auto p-15 bg-white bg-opacity-90 rounded-2xl shadow-xl"
        style={{ zIndex: 1 }}
      >
        <h1 className="text-3xl font-bold text-center mb-6">My Society</h1>
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

        <div className="mt-6 text-center">
          <button
            style={{
              backgroundColor: 'var(--color-primary)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dull)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            className="text-white px-6 py-2 rounded-xl transition"
          >
            Leave Society
          </button>
        </div>
      </div>
    </div>
  );
};

export default MySociety;
