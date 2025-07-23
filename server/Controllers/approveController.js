import User from "../Models/User.js";
import JoinRequest from "../Models/JoinRequest.js"; 


export const getPendingUsers = async (req, res) => {
  try {
    const pendingRequests = await JoinRequest.find({ status: "pending" })
      .sort({ requested_at: -1 }) // show latest first
      .populate("user_id", "user_id name email phone_no address")
      .populate("society_id", "name location");

    const formatted = pendingRequests.map((request) => ({
      _id: request._id,
      user_id: {
        _id: request.user_id?._id || null,
        user_id: request.user_id?.user_id || "N/A",
        name: request.user_id?.name || "N/A",
        email: request.user_id?.email || "N/A",
        phone_no: request.user_id?.phone_no || "N/A",
        address: request.user_id?.address || "N/A",
      },
      society_id: {
        _id: request.society_id?._id || null,
        name: request.society_id?.name || "N/A",
        location: request.society_id?.location || "N/A",
      },
      requested_at: request.requested_at,
    }));

    return res.status(200).json({
      message: "Pending join requests fetched successfully",
      requests: formatted,
    });
  } catch (err) {
    console.error("Error fetching join requests:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

