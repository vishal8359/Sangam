import mongoose from "mongoose";
import Complaint from "../Models/Complaint.js";
import User from "../Models/User.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import sendEmail from "../Utils/emailService.js";
import { v2 as cloudinary } from "cloudinary";

// Submit a new complaint
export const submitComplaint = async (req, res) => {
  try {
    const { complaint_type, description, house_no } = req.body;
    const userId = req.user._id;

    // Fetch full user if `joined_society` not present in req.user
    let user = req.user;
    if (!user.joined_society && user.joined_societies?.length) {
      user.joined_society = user.joined_societies[0];
    }

    if (!user.joined_society) {
      const freshUser = await User.findById(userId);
      if (!freshUser?.joined_societies?.length) {
        return res
          .status(400)
          .json({ message: "User must be part of a society" });
      }
      user.joined_society = freshUser.joined_societies[0];
    }

    const file = req.file
      ? await uploadToCloudinary(req.file.path, "complaints")
      : null;

    const complaint = await Complaint.create({
      user: user._id,
      house_no,
      complaint_type,
      description,
      file_url: file?.url || null,
      file_id: file?.public_id || null,
      society_id: user.joined_society,
    });

    // Optional: Send Email to Admin
    const admin = await User.findOne({
      roles: {
        $elemMatch: {
          role: "admin",
          society_id: user.joined_society,
        },
      },
    });

    if (!admin) {
      console.warn("❌ No admin found for society:", user.joined_society);
    } else if (!admin.email) {
      console.warn("❌ Admin found but email is missing");
    } else {
      try {
        console.log("🔔 Sending complaint email to:", admin.email);
        await sendEmail({
          to: admin.email,
          subject: `New Complaint from House ${house_no}`,
          text: `${complaint_type.toUpperCase()} - ${description}\n\nView in dashboard.`,
        });
      } catch (err) {
        console.error("❌ Email sending failed:", err.message);
      }
    }

    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (err) {
    console.error("Submit complaint error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all complaints for a society (with resident name)
export const getComplaintsBySociety = async (req, res) => {
  try {
    const { societyId } = req.params;

    const complaints = await Complaint.find({ society_id: societyId })
      .populate({
        path: "user",
        model: "User", // ✅ Fix here
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("❌ Fetch complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark complaint as resolved
export const resolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId).populate({
      path: "user",
      model: "User", // ✅ Fix here
      select: "name email",
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update status
    complaint.status = "Resolved";
    await complaint.save();

    // Send email to user if email exists
    if (complaint.user?.email) {
      await sendEmail({
        to: complaint.user.email,
        subject: `Your complaint has been resolved`,
        text: `Hi ${
          complaint.user.user_name || "Resident"
        },\n\nYour complaint regarding "${
          complaint.complaint_type
        }" has been resolved.\n\nThank you for your patience.\n\n- Sangam Society Team`,
      });
    }

    res.status(200).json({
      message: "Complaint marked as resolved",
      complaint,
    });
  } catch (err) {
    console.error("❌ Resolve complaint error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComplaint = async (req, res) => {
  const { complaintId } = req.params;
  try {
    const complaint = await Complaint.findByIdAndDelete(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const getResolvedComplaints = async (req, res) => {
  try {
    const { societyId } = req.params;

    const complaints = await Complaint.find({
      society_id: societyId,
      status: "Resolved",
    })
      .populate({
        path: "user",
        model: "User", // ✅ Fix here
        select: "name email",
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("❌ Get resolved complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
