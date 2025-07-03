import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

const ViewInvitations = () => {
  const { token, axios } = useAppContext();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await axios.get("/api/users/events/invitations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
      } catch (err) {
        console.error("Failed to fetch invitations:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchInvitations();
  }, [token]);

  return (
    <div className="py-10 px-6 md:px-20 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <h2 className="text-3xl font-bold mb-10 text-center text-blue-800">
        Received Invitations
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading invitations...</p>
      ) : invitations.length === 0 ? (
        <p className="text-center text-gray-500">No invitations received yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map((invite, index) => (
            <motion.div
              key={invite._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative w-full flex justify-between items-start bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition p-4 gap-4 flex-row"
            >
              {/* Left Text Section */}
              <div className="flex flex-col flex-grow">
                {invite.event?.isCancelled && (
                  <div className="mb-1 flex items-center text-red-600 font-semibold text-sm">
                    <FaStar className="mr-1" />
                    Cancelled
                  </div>
                )}

                <h3 className="text-lg font-semibold text-blue-700 mb-1">
                  {invite.event?.eventName || "Untitled Event"}
                </h3>
                <p className="text-gray-700 text-sm">
                  <strong>Organizer:</strong> {invite.event?.organiserName || "Unknown"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Address:</strong> {invite.invitedBy?.address || "N/A"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Location:</strong> {invite.event?.place || "N/A"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Date:</strong>{" "}
                  {invite.event?.date ? new Date(invite.event.date).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Time:</strong> {invite.event?.time || "N/A"}
                </p>
                {invite.event?.description && (
                  <div className="mt-2 text-xs text-gray-600 italic border-t pt-2">
                    {invite.event.description}
                  </div>
                )}
              </div>

              {/* Right Image Section */}
              <div className="shrink-0 w-24 h-24 sm:w-36 sm:h-36 rounded-md overflow-hidden">
                <img
                  src={invite.event?.image || `https://source.unsplash.com/300x300/?event`}
                  alt={invite.event?.eventName || "Event"}
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
