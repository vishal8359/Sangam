import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import Society from "../Models/Society.js";
import JoinRequest from "../Models/JoinRequest.js";
import Home from "../Models/Home.js";
import sendSMS from "../Utils/smsService.js";
import { extractSortOrder } from "./getNeighbourHomes.js";
import mongoose from "mongoose"; // Import mongoose to use ObjectId.isValid
import Invitation from "../Models/Invitation.js";
const pendingRegistrations = new Map();
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";
import { deleteFileFromCloudinary } from "../Utils/cloudinaryUpload.js";
import sendEmail from "../Utils/emailService.js";
import DeliveryAddress from "../Models/DeliveryAddress.js"; // Import the new model


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Helper function to get formatted address from delivery_addresses array (now an array of populated objects)
const getFormattedAddress = (addresses) => {
  if (!addresses || addresses.length === 0) {
    return "N/A";
  }
  const defaultAddress =
    addresses.find((addr) => addr.isDefault) || addresses[0];
  if (defaultAddress) {
    return `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.zipcode}, ${defaultAddress.country}`;
  }
  return "N/A";
};

export const registerResident = async (req, res) => {
  try {
    const {
      user_name,
      email,
      phone_no,
      address,
      password,
      confirm_password,
      // electricity_bill_no,
    } = req.body;

    const avatarFile = req.file;

    if (
      !user_name ||
      !email ||
      !phone_no ||
      !address ||
      !password ||
      !confirm_password 
      // ||
      // !electricity_bill_no
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    let avatarUrl = "";
    if (avatarFile) {
      try {
        const result = await uploadToCloudinary(
          avatarFile.buffer,
          "avatars",
          avatarFile.mimetype
        );
        avatarUrl = result.secure_url;
      } catch (uploadError) {
        console.error(
          "❌ Cloudinary avatar upload failed during registration:",
          uploadError
        );
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    pendingRegistrations.set(phone_no, {
      user_name,
      email,
      address,
      password,
      // electricity_bill_no,
      otp,
      otpExpiry,
      avatar: avatarUrl,
    });

    await sendSMS(
      phone_no,
      `🔐 Your OTP for society registration is: ${otp}. Valid for 5 minutes.`
    );

    return res.status(200).json({ message: "OTP sent for verification" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone_no, otp } = req.body;

  try {
    const pendingData = pendingRegistrations.get(phone_no);

    if (!pendingData) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    // Check if OTP matches and is not expired
    if (pendingData.otp !== otp || Date.now() > pendingData.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const hashedPassword = await bcrypt.hash(pendingData.password, 10);
    const [houseNumber, ...rest] = pendingData.address.split(",");
    const street = rest.join(",").trim();

    let home = await Home.findOne({
      // electricity_bill_no: pendingData.electricity_bill_no,
      street,
      houseNumber: houseNumber.trim(),
    });

    if (!home) {
      home = await Home.create({
        // electricity_bill_no: pendingData.electricity_bill_no,
        houseNumber: houseNumber.trim(),
        street,
        houseSortOrder: extractSortOrder(houseNumber),
        residents: [],
      });
    }

    const newUser = await User.create({
      user_id: uuidv4(),
      name: pendingData.user_name,
      email: pendingData.email,
      phone_no,
      address: pendingData.address,
      password: hashedPassword,
      home_id: home._id,
      is_verified: true,
      is_approved: false,
      roles: [],
      avatar: pendingData.avatar || "",
      delivery_addresses: [], // Initialize as empty array of ObjectIds
    });

    home.residents.push(newUser._id);
    await home.save();

    pendingRegistrations.delete(phone_no);

    await sendSMS(
      phone_no,
      `✅ Registration complete! Hello ${newUser.name}, your User ID is: ${newUser.user_id} \nHome ID: ${home._id}\nPlease login with your Society ID to complete joining.`
    );
    await sendEmail({
      to: newUser.email,
      subject: "Welcome to Sangam! Your Registration Details",
      text: `Hi ${newUser.name},\n\nWelcome to Sangam! Your registration is complete.\n\nHere are your login details:\nUser ID: ${newUser.user_id}\nPassword: ${pendingData.password}\n\nPlease keep these details secure. You can now log in with your Society ID to join your community.\n\nBest regards,\nThe SocietyConnect Team`,
    });

    res.status(201).json({
      message: "User created. Login with your Society ID to request joining.",
      user_id: newUser.user_id,
      home_id: home._id,
    });
  } catch (err) {
    console.error("❌ OTP Verification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { user_id, password, society_id } = req.body;

  if (!user_id || !password || !society_id) {
    return res.status(400).json({
      success: false,
      message: "User ID, Society ID, and Password are required.",
    });
  }

  try {
    const user = await User.findOne({ user_id }).populate("home_id");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const society = await Society.findById(society_id);
    if (!society) {
      return res.status(400).json({
        success: false,
        message: "Invalid Society ID.",
      });
    }
    const userRoleInSociety = user.roles.find(
      (r) => r.society_id.toString() === society_id
    );

    if (!userRoleInSociety || !user.is_approved) {
      const existing = await JoinRequest.findOne({
        user_id: user._id,
        society_id,
        status: { $in: ["pending", "approved"] },
      });

      if (!existing) {
        await JoinRequest.create({
          user_id: user._id,
          society_id,
          status: "pending",
          requested_at: new Date(),
        });
      }

      return res.status(403).json({
        success: false,
        message: "Join request sent for approval. You will be notified via email after approval by admin.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), societyId: society_id.toString(), role: userRoleInSociety.role }, // Ensure IDs are strings
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      userId: user._id.toString(), // Ensure frontend gets ObjectId as string
      houseId: user.home_id?.toString() || "",
      societyId: society_id.toString(),
      userRole: userRoleInSociety.role, // Use the actual role found
      userProfile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        address: user.address,
        phone_no: user.phone_no,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export const createSociety = async (req, res) => {
  try {
    const { name, house, contact, email, password, location } = req.body;

    if (!name || !house || !contact || !password || !location) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let user = await User.findOne({ phone_no: contact });
    let isNewUser = false;

    const [houseNumber, ...rest] = house.split(",");
    const street = rest.join(",").trim();

    // NEW VALIDATION: Check if street is empty after parsing
    if (!street) {
      return res
        .status(400)
        .json({
          message:
            "House field must include both house number and street name (e.g., 'D-1/408, Main Street').",
        });
    }

    const newHome = await Home.create({
      // electricity_bill_no: "N/A-" + uuidv4().split("-")[0],
      houseNumber: houseNumber.trim(),
      street,
      houseSortOrder: extractSortOrder(houseNumber),
      residents: [],
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        user_id: uuidv4().split("-")[0],
        name,
        email,
        phone_no: contact,
        password: hashedPassword,
        address: house,
        is_approved: true, // Admin user should be approved immediately
        is_verified: true,
        roles: [],
        home_id: newHome._id,
        delivery_addresses: [],
      });

      await user.save();
      isNewUser = true;
    } else {
      // If user exists, ensure they are approved for society creation
      user.is_approved = true; // Ensure existing user is marked as approved if they are creating a society
      user.home_id = newHome._id;
      await user.save();
    }

    newHome.residents.push(user._id);
    await newHome.save();

    const newSociety = await Society.create({
      name: `${name}'s Society`,
      location,
      created_by: user._id,
      residents: [user._id],
    });

    user.roles.push({ society_id: newSociety._id, role: "admin" });
    await user.save(); // Save user again after updating roles

    await sendSMS(
      contact,
      `🎉 Society Created!
Admin: ${user.name}
🆔 User ID: ${user.user_id}
🏠 Home ID: ${newHome._id}
🔑 Use your password to login.`
    );

    const emailContentHtml = `
      <p>Dear ${user.name},</p>
      <p>Congratulations! Your society, <strong>${
        newSociety.name
      }</strong>, has been successfully created on the Sangam Society App.</p>
      <p>You are now registered as the admin of this society.</p>
      <p><strong>Society Name:</strong> ${newSociety.name}</p>
      <p><strong>Society ID:</strong> ${newSociety._id}</p>
      <p><strong>Location:</strong> ${JSON.stringify(newSociety.location)}</p>
      <p><strong>Your User ID:</strong> ${user.user_id}</p>
      <p><strong>Your Home ID:</strong> ${newHome._id}</p>
      <p>You can now invite other residents to join your society using the Society ID. Please keep your User ID and password secure.</p>
      <p>Best regards,<br/>The Sangam Society App Team</p>
    `;

    const plainTextContent = `
Dear ${user.name},

Congratulations! Your society, ${
      newSociety.name
    }, has been successfully created on the Sangam Society App.
You are now registered as the admin of this society.

Society Name: ${newSociety.name}
Society ID: ${newSociety._id}
Location: ${JSON.stringify(newSociety.location)}
Your User ID: ${user.user_id}
Your Home ID: ${newHome._id}

You can now invite other residents to join your society using the Society ID. Please keep your User ID and password secure.

Best regards,
The Sangam Society App Team
`;

    await sendEmail({
      to: user.email,
      subject: `🎉 Your Society "${newSociety.name}" Has Been Created!`,
      html: emailContentHtml,
      text: plainTextContent,
    });

    // --- DEBUGGING LOGS START (JWT Sign - createSociety) ---
    console.log("--- JWT Signing (createSociety) ---");
    console.log("Signing JWT with userId (user._id):", user._id.toString());
    console.log("Signing JWT with societyId:", newSociety._id.toString());
    console.log("Signing JWT with role: admin");
    // --- DEBUGGING LOGS END (JWT Sign - createSociety) ---

    const token = jwt.sign(
      { userId: user._id.toString(), societyId: newSociety._id.toString(), role: "admin" }, // Ensure IDs are strings
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Society created successfully.",
      society_id: newSociety._id.toString(),
      userId: user._id.toString(), // Ensure frontend gets ObjectId as string
      home_id: newHome._id.toString(),
      token, // Include the token in the response
      userRole: "admin", // Explicitly send the role
      userProfile: { // Include userProfile for consistency
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone_no: user.phone_no,
        address: user.address,
      },
    });
  } catch (err) {
    console.error("Society creation error:", err);
    return res
      .status(500)
      .json({ message: "Server error during society creation" });
  }
};
export const requestJoinSociety = async (req, res) => {
  try {
    const userId = req.user._id;
    const societyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(societyId)) {
      return res.status(400).json({ message: "Invalid society ID." });
    }

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ message: "Society not found." });
    }

    const existing = await JoinRequest.findOne({
      user_id: userId,
      society_id: societyId,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(400).json({
        message:
          "You already have a pending or approved request for this society.",
      });
    }

    const request = await JoinRequest.create({
      user_id: userId,
      society_id: societyId,
      status: "pending",
      requested_at: new Date(),
    });

    res.status(201).json({ message: "Join request sent", request });
  } catch (err) {
    console.error("Join request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventInvitations = async (req, res) => {
  try {
    const userId = req.user._id;

    const invitations = await Invitation.find({ invitedUser: userId })
      .populate("event")
      .populate("invitedBy", "name");

    res.status(200).json({ invitations });
  } catch (err) {
    console.error("Failed to fetch invitations:", err);
    res.status(500).json({ message: "Failed to get invitations" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("delivery_addresses") // Populate delivery_addresses
      .select("-password -otp -otp_expiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        _id: user._id.toString(), // Ensure IDs are strings
        name: user.name,
        email: user.email,
        phone_no: user.phone_no,
        address: user.address,
        delivery_addresses: user.delivery_addresses || [],
        avatar: user.avatar,
        // electricity_bill_no: user.electricity_bill_no,
        home_id: user.home_id?.toString(), // Ensure IDs are strings
        societyId: user.roles[0]?.society_id?.toString(), // Ensure IDs are strings
        user_id: user.user_id,
        servicesOffered: user.servicesOffered || [],
      },
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "_id")
      .select("name avatar address followers");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("delivery_addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone_no) user.phone_no = req.body.phone_no;
    if (req.body.address) user.address = req.body.address;

    if (req.file) {
      if (user.avatar) {
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await deleteFileFromCloudinary(publicId);
      }
      const result = await uploadToCloudinary(
        req.file.buffer,
        "avatars",
        req.file.mimetype
      );
      user.avatar = result.secure_url;
    }

    await user.save();

    console.log("avatar : ", user.avatar);

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        _id: user._id.toString(), // Ensure IDs are strings
        name: user.name,
        email: user.email,
        phone_no: user.phone_no,
        address: user.address,
        delivery_addresses: user.delivery_addresses || [],
        avatar: user.avatar,
        // electricity_bill_no: user.electricity_bill_no,
        home_id: user.home_id?.toString(), // Ensure IDs are strings
        societyId: user.roles[0]?.society_id?.toString(), // Ensure IDs are strings
        user_id: user.user_id,
        servicesOffered: user.servicesOffered || [],
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addDeliveryAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !street ||
      !city ||
      !state ||
      !zipcode ||
      !country ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All delivery address fields are required.",
      });
    }

    const newDeliveryAddress = new DeliveryAddress({
      userId: userId,
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
      isDefault: false,
    });

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.delivery_addresses.length === 0) {
      newDeliveryAddress.isDefault = true;
    } else {
      // If there are existing addresses, ensure only one is default
      const currentDefault = await DeliveryAddress.findOne({
        userId: userId,
        isDefault: true,
      });
      if (!currentDefault) {
        // If no default is found, make this the default
        newDeliveryAddress.isDefault = true;
      }
    }

    await newDeliveryAddress.save();
    user.delivery_addresses.push(newDeliveryAddress._id);
    await user.save();

    // Re-populate delivery_addresses to send the full objects in the response
    const updatedUser = await User.findById(userId).populate(
      "delivery_addresses"
    );

    res.status(200).json({
      success: true,
      message: "Delivery address saved successfully!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error saving delivery address:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const setDefaultDeliveryAddress = async (req, res) => {
  // Renamed for clarity
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Unset current default address for this user
    await DeliveryAddress.updateMany(
      { userId: userId, isDefault: true },
      { $set: { isDefault: false } }
    );

    // Set the new default address
    const updatedAddress = await DeliveryAddress.findOneAndUpdate(
      { _id: addressId, userId: userId },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found or does not belong to user.",
      });
    }

    // Re-populate delivery_addresses for the response
    const updatedUser = await User.findById(userId).populate(
      "delivery_addresses"
    );

    res.status(200).json({
      success: true,
      message: "Default delivery address set successfully!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error setting default delivery address:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDeliveryAddress = async (req, res) => {
  // Renamed for clarity
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find the address to be deleted
    const addressToDelete = await DeliveryAddress.findOne({
      _id: addressId,
      userId: userId,
    });

    if (!addressToDelete) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found or does not belong to user.",
      });
    }

    // Remove the address from the user's array of references
    user.delivery_addresses = user.delivery_addresses.filter(
      (id) => id.toString() !== addressId
    );
    await user.save();

    // Delete the actual DeliveryAddress document
    await DeliveryAddress.deleteOne({ _id: addressId });

    // If the deleted address was the default, set a new default if other addresses exist
    if (addressToDelete.isDefault && user.delivery_addresses.length > 0) {
      const firstRemainingAddressId = user.delivery_addresses[0];
      await DeliveryAddress.findByIdAndUpdate(firstRemainingAddressId, {
        $set: { isDefault: true },
      });
    }

    // Re-populate delivery_addresses for the response
    const updatedUser = await User.findById(userId).populate(
      "delivery_addresses"
    );

    res.status(200).json({
      success: true,
      message: "Delivery address deleted successfully!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error deleting delivery address:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



export const googleLogin = async (req, res) => {
  const { googleIdToken, society_id } = req.body;

  if (!googleIdToken || !society_id) {
    return res.status(400).json({
      success: false,
      message: "Google ID Token and Society ID are required.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(society_id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Society ID format.",
    });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account must have an email address.",
      });
    }

    const society = await Society.findById(society_id);
    if (!society) {
      return res.status(400).json({
        success: false,
        message: "Invalid Society ID.",
      });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const generatedUserId = `google_${email.split('@')[0]}_${Date.now().toString().slice(-4)}`;
      
      user = await User.create({
        user_id: generatedUserId,
        email,
        name,
        avatar: picture,
        password: await bcrypt.hash(Date.now().toString(), 10),
        is_approved: false,
        roles: [],
        phone_no: "N/A",
        address: "N/A",
      });
    }

    const userRoleInSociety = user.roles.find(
      (r) => r.society_id.toString() === society_id.toString()
    );

    if (userRoleInSociety && user.is_approved) {
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          societyId: society_id.toString(),
          role: userRoleInSociety.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        userId: user._id.toString(),
        houseId: user.home_id?.toString() || "",
        societyId: society_id.toString(),
        userRole: userRoleInSociety.role,
        userProfile: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          address: user.address,
          phone_no: user.phone_no,
        },
      });
    } else {
      let existingJoinRequest = await JoinRequest.findOne({
        user_id: user._id,
        society_id,
        status: { $in: ["pending", "approved"] },
      });

      if (existingJoinRequest) {
        if (existingJoinRequest.status === "pending") {
          return res.status(403).json({
            success: false,
            message:
              "Your join request for this society is pending admin approval.",
          });
        } else if (existingJoinRequest.status === "approved" && !user.is_approved) {
          return res.status(403).json({
            success: false,
            message:
              "Your join request was approved, but your account is not yet active. Please contact the society admin.",
          });
        }
      } else {
        await JoinRequest.create({
          user_id: user._id,
          society_id,
          status: "pending",
          requested_at: new Date(),
        });

        return res.status(403).json({
          success: false,
          message:
            "Your join request for this society has been submitted and is pending admin approval. You will be notified via email after approval.",
        });
      }
    }
  } catch (err) {
    console.error("Google Login Error:", err);
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid or expired Google token." });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during Google login. Please try again.",
    });
  }
};
