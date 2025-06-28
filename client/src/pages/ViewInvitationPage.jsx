import React from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import sports_img from "../assets/sports.jpg";
import ind_img from "../assets/independence.jpeg";

const invitations = [
  {
    id: 1,
    eventName: "Community Sports Day",
    organizerName: "Rohit Sharma",
    address: "Flat 203, Tower B",
    location: "Central Playground",
    date: "2025-07-15",
    time: "16:00",
    description: "Bring your own water bottles and wear sports shoes.",
    isCancelled: false,
    img: sports_img,
  },
  {
    id: 2,
    eventName: "Independence Day Flag Hoisting",
    organizerName: "Ananya Verma",
    address: "Flat 101, Tower A",
    location: "Main Garden",
    date: "2025-08-15",
    time: "08:00",
    description: "",
    isCancelled: true,
    img: ind_img,
  },
  // Add more if needed
];

const ViewInvitations = () => {
  return (
    <div className="py-10 px-6 md:px-20 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <h2 className="text-3xl font-bold mb-10 text-center text-blue-800">
        Received Invitations
      </h2>

      {invitations.length === 0 ? (
        <p className="text-center text-gray-500">
          No invitations received yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map((invite) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: invite.id * 0.1 }}
              className="relative w-full flex justify-between items-start bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition p-4 gap-4 flex-row"
            >
              {/* Left Text Section */}
              <div className="flex flex-col flex-grow">
                {invite.isCancelled && (
                  <div className="mb-1 flex items-center text-red-600 font-semibold text-sm">
                    <FaStar className="mr-1" />
                    Cancelled
                  </div>
                )}

                <h3 className="text-lg font-semibold text-blue-700 mb-1">
                  {invite.eventName}
                </h3>
                <p className="text-gray-700 text-sm">
                  <strong>Organizer:</strong> {invite.organizerName}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Address:</strong> {invite.address}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Location:</strong> {invite.location}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Date:</strong>{" "}
                  {new Date(invite.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Time:</strong> {invite.time}
                </p>
                {invite.description && (
                  <div className="mt-2 text-xs text-gray-600 italic border-t pt-2">
                    {invite.description}
                  </div>
                )}
              </div>

              {/* Right Image Section */}
              <div className="shrink-0 w-24 h-24 sm:w-36 sm:h-36 rounded-md overflow-hidden">
                <img
                  src={invite.img}
                  alt={invite.eventName}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewInvitations;
