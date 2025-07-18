import mongoose from "mongoose";
import Complaint from "../Models/Complaint.js";
import User from "../Models/User.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import sendEmail from "../Utils/emailService.js";

export const submitComplaint = async (req, res) => {
  try {
    const { complaint_type, description, house_no } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    let user = req.user;
    if (!user.joined_society && user.joined_societies?.length) {
      user.joined_society = user.joined_societies[0];
    }

    if (!user.joined_society) {
      const freshUser = await User.findById(userId);
      if (!freshUser?.joined_societies?.length) {
        return res
          .status(400)
          .json({ message: "User must be part of a society." });
      }
      user.joined_society = freshUser.joined_societies[0];
    }

    if (!complaint_type || !description || !house_no) {
      return res
        .status(400)
        .json({
          message: "Complaint type, description, and house number are required.",
        });
    }

    let fileData = null;
    if (req.file) {
      try {
        fileData = await uploadToCloudinary(
          req.file.buffer,
          "complaints",
          req.file.mimetype
        );
      } catch (uploadError) {
        console.error("Cloudinary upload error in controller:", uploadError);
        return res.status(500).json({ message: "Failed to upload file to cloud storage." });
      }
    }

    const complaint = await Complaint.create({
      user: userId,
      name: userName,
      house_no,
      complaint_type,
      description,
      file_url: fileData?.url || null,
      file_id: fileData?.public_id || null,
      society_id: user.joined_society,
    });

    const admin = await User.findOne({
      roles: {
        $elemMatch: {
          role: "admin",
          society_id: user.joined_society,
        },
      },
    });

    if (!admin) {
      console.warn("No admin found for society:", user.joined_society);
    } else if (!admin.email) {
      console.warn("Admin found but email is missing");
    } else {
      try {
        console.log("Sending complaint email to:", admin.email);
        await sendEmail({
          to: admin.email,
          subject: `New Complaint from House ${house_no}`,
          text: `A new complaint of type ${complaint_type} has been submitted by ${userName} (House No: ${house_no}).\n\nDescription: ${description}\n\nView in dashboard.`,
        });
      } catch (err) {
        console.error("Email sending failed:", err.message);
      }
    }

    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (err) {
    console.error("Submit complaint error:", err);
    res
      .status(500)
      .json({ message: "Server error during complaint submission." });
  }
};

export const getComplaintsBySociety = async (req, res) => {
  try {
    const { societyId } = req.params;

    const complaints = await Complaint.find({ society_id: societyId })
      .populate({
        path: "user",
        model: "User",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Fetch complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId).populate({
      path: "user",
      model: "User",
      select: "name email",
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "Resolved";
    await complaint.save();

    if (complaint.user?.email) {
      await sendEmail({
        to: complaint.user.email,
        subject: `Your complaint has been resolved`,
        text: `Hi ${
          complaint.user.name || "Resident"
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
    console.error("Resolve complaint error:", err);
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
        model: "User",
        select: "name email",
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Get resolved complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addComplaintReply = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { replyText } = req.body;
    const adminId = req.user._id;
    const adminName = req.user.name;

    if (!replyText || replyText.trim() === '') {
      return res.status(400).json({ message: "Reply text cannot be empty." });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (!complaint.replies) {
        complaint.replies = [];
    }
    complaint.replies.push({
      text: replyText,
      admin: adminId,
      adminName: adminName,
      createdAt: new Date(),
    });

    await complaint.save();

    const user = await User.findById(complaint.user);
    if (user && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Update on your Complaint (ID: ${complaint._id.toString().slice(-6)})`,
          text: `Dear ${user.name || 'Resident'},\n\nYour complaint (${complaint.complaint_type} - House No: ${complaint.house_no}) has received a new reply from the administration:\n\n"${replyText}"\n\nPlease log in to your dashboard to view the full complaint details.\n\n- Sangam Society Team`,
        });
      } catch (emailError) {
        console.error("Error sending reply email to user:", emailError.message);
      }
    }

    res.status(200).json({ message: "Reply added successfully.", complaint });

  } catch (err) {
    console.error("Error adding complaint reply:", err);
    res.status(500).json({ message: "Server error while adding reply." });
  }
};