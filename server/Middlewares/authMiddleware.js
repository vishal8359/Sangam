import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// General user auth middleware
export const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("home_id");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Attach simplified and enriched user object
    req.user = {
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone_no: user.phone_no,
      address: user.address, 
      avatar: user.avatar,
      societyId: user.created_society || user.joined_societies?.[0], // key part
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Admin-only middleware
export const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if user has any admin role
    const isAdmin = user.roles?.some(r => r.role === "admin");

    if (!isAdmin) {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};


// Middlewares/authMiddleware.js
export const verifyUserOrAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    req.user = user;
    req.isAdmin = user.roles?.some(r => r.role === "admin"); // optional helper
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
