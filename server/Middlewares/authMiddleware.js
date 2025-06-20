import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// General user auth middleware
export const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    req.user = user;
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
