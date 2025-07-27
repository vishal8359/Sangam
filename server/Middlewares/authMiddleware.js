import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import mongoose from "mongoose"; // Import mongoose for ObjectId.isValid

// General user auth middleware
export const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ verifyUser: No token provided.");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      "✅ verifyUser: Token decoded successfully. Decoded payload:",
      decoded
    );

    // Ensure userId and societyId are present in the token payload
    if (!decoded.userId || !decoded.societyId) {
      console.log(
        "❌ verifyUser: Invalid token payload - missing userId or societyId.",
        decoded
      );
      return res
        .status(401)
        .json({ msg: "Invalid token payload: missing userId or societyId" });
    }

    // Validate decoded.userId format before querying
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.log(
        `❌ verifyUser: Invalid userId format in token: '${decoded.userId}'`
      );
      return res
        .status(400)
        .json({ msg: "Invalid user ID in token. Please log in again." });
    }

    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("home_id");

    if (!user) {
      console.log(
        "❌ verifyUser: User not found in DB for decoded userId:",
        decoded.userId
      );
      return res.status(404).json({ msg: "User not found" });
    }

    console.log(
      "✅ verifyUser: User found in DB. User Name:",
      user.name,
      "MongoDB _id:",
      user._id
    );

    // Attach simplified and enriched user object
    req.user = {
      _id: user._id.toString(), // Ensure _id is string
      role: decoded.role, // Use role from token for consistency
      name: user.name,
      email: user.email,
      phone_no: user.phone_no,
      address: user.address,
      avatar: user.avatar,
      societyId: decoded.societyId, // Use societyId from token
    };
    console.log(
      "✅ verifyUser: User is authorized. Proceeding to next middleware."
    );
    next();
  } catch (err) {
    console.error("❌ Auth error in verifyUser catch block:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ msg: "Token expired, please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token." });
    } else {
      return res
        .status(500)
        .json({ msg: "Authentication failed due to server error." });
    }
  }
};

// Admin-only middleware
export const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ verifyAdmin: No token provided in headers.");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("--- verifyAdmin Debugging ---");
    console.log(
      "✅ verifyAdmin: Token decoded successfully. Decoded payload:",
      decoded
    );

    if (!decoded.userId || !decoded.societyId || !decoded.role) {
      // Ensure role is also present
      console.log(
        "❌ verifyAdmin: Invalid token payload - missing userId, societyId, or role.",
        decoded
      );
      return res
        .status(401)
        .json({
          msg: "Invalid token payload: missing userId, societyId, or role",
        });
    }

    // Validate decoded.userId format before querying
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.log(
        `❌ verifyAdmin: Invalid userId format in token: '${decoded.userId}'`
      );
      return res
        .status(400)
        .json({ msg: "Invalid user ID in token. Please log in again." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(
        "❌ verifyAdmin: User not found in DB for decoded userId:",
        decoded.userId
      );
      return res.status(404).json({ msg: "User not found" });
    }

    console.log(
      "✅ verifyAdmin: User found in DB. User Name:",
      user.name,
      "MongoDB _id:",
      user._id
    );
    console.log("User's roles array from DB:", user.roles);
    console.log(
      "Society ID from token (decoded.societyId):",
      decoded.societyId
    );
    console.log("Role from token (decoded.role):", decoded.role);

    // Check if the user has the 'admin' role for the specific society in the token
    const isAdminForSociety = user.roles?.some((r) => {
      const isRoleAdmin = r.role === "admin";
      const isSocietyMatch = r.society_id?.toString() === decoded.societyId;
      console.log(
        `  Checking role entry: DB Role: '${
          r.role
        }', Is Admin: ${isRoleAdmin}, DB Society ID: '${r.society_id?.toString()}', Decoded Society ID: '${
          decoded.societyId
        }', Society Match: ${isSocietyMatch}`
      );
      return isRoleAdmin && isSocietyMatch;
    });

    console.log("Final result of isAdminForSociety check:", isAdminForSociety);

    if (!isAdminForSociety) {
      console.log(
        "❌ verifyAdmin: Access denied - User is NOT an admin for this society."
      );
      return res
        .status(403)
        .json({ msg: "Access denied: Not an admin for this society" });
    }

    // If all checks pass, attach user info to request and proceed
    req.user = {
      _id: user._id.toString(),
      societyId: decoded.societyId,
      role: decoded.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone_no: user.phone_no,
      address: user.address,
    };
    console.log(
      "✅ verifyAdmin: User is authorized as admin. Proceeding to next middleware."
    );
    next();
  } catch (err) {
    console.error("❌ Auth error in verifyAdmin catch block:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ msg: "Token expired, please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token." });
    } else if (err.name === "CastError" && err.path === "_id") {
      return res
        .status(400)
        .json({ msg: "Invalid user ID in token. Please log in again." });
    } else {
      return res
        .status(500)
        .json({ msg: "Authentication failed due to server error." });
    }
  }
};

// Middlewares/authMiddleware.js
export const verifyUserOrAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ verifyUserOrAdmin: No token provided.");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      "✅ verifyUserOrAdmin: Token decoded successfully. Decoded payload:",
      decoded
    );

    if (!decoded.userId || !decoded.societyId) {
      console.log(
        "❌ verifyUserOrAdmin: Invalid token payload - missing userId or societyId.",
        decoded
      );
      return res
        .status(401)
        .json({ msg: "Invalid token payload: missing userId or societyId" });
    }

    // Validate decoded.userId format before querying
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.log(
        `❌ verifyUserOrAdmin: Invalid userId format in token: '${decoded.userId}'`
      );
      return res
        .status(400)
        .json({ msg: "Invalid user ID in token. Please log in again." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(
        "❌ verifyUserOrAdmin: User not found in DB for decoded userId:",
        decoded.userId
      );
      return res.status(404).json({ msg: "User not found" });
    }

    console.log(
      "✅ verifyUserOrAdmin: User found in DB. User Name:",
      user.name,
      "MongoDB _id:",
      user._id
    );

    req.user = {
      _id: user._id.toString(),
      societyId: decoded.societyId,
      role: decoded.role, // Use role from token
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone_no: user.phone_no,
      address: user.address,
    };
    // Determine if the user is an admin for the *current* society (from token)
    req.isAdmin = user.roles?.some(
      (r) => r.role === "admin" && r.society_id.toString() === decoded.societyId
    );
    console.log(
      "✅ verifyUserOrAdmin: User is authorized. isAdmin:",
      req.isAdmin,
      "Proceeding to next middleware."
    );
    next();
  } catch (err) {
    console.error("❌ Auth error in verifyUserOrAdmin:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ msg: "Token expired, please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token." });
    } else if (err.name === "CastError" && err.path === "_id") {
      return res
        .status(400)
        .json({ msg: "Invalid user ID in token. Please log in again." });
    } else {
      return res
        .status(500)
        .json({ msg: "Authentication failed due to server error." });
    }
  }
};
