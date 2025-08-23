import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

// Middleware to authenticate the user
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from cookies
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  // Read from Authorization header if not in cookies
  else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token format." });
    }

    // Attach user to req.user excluding password
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate('connections', 'fullName userType'); // Populate basic connection info

    if (!user) {
      return res.status(404).json({ message: "User not found or deactivated." });
    }

    // Check if token was issued before password change
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
      if (tokenIssuedAt < user.passwordChangedAt.getTime()) {
        return res.status(401).json({ message: "Password was recently changed. Please login again." });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired." });
    }
    return res.status(401).json({ message: "Authentication failed." });
  }
});

// Middleware to authorize only healthcare providers
const authorizeHealthcareProvider = (req, res, next) => {
  if (req.user && req.user.userType === "healthcareProvider") {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized, only healthcare providers can perform this action." });
  }
};

// Middleware to authorize parents or healthcare providers (view-only access)
const authorizeParentOrHealthcare = (req, res, next) => {
  if (req.user && (req.user.userType === "parent" || req.user.userType === "healthcareProvider")) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized to view these records." });
  }
};

// Middleware to authorize only admin users
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized, admin access required." });
  }
};

// Middleware to authorize parents to access only their own or connected profiles
const authorizeParentAccess = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;

  if (!profileId) {
    return res.status(400).json({ message: "Profile ID is required." });
  }

  // If user is healthcare provider or admin, allow access
  if (req.user.userType === "healthcareProvider" || req.user.isAdmin) {
    return next();
  }

  // For parents, check if the profile is their own or a connected profile
  if (req.user.userType === "parent") {
    if (req.user._id.toString() === profileId) {
      return next();
    }

    // Check connected profiles
    const user = await User.findById(req.user._id).populate('connections');
    const hasAccess = user.connections.some(connection => 
      connection._id.toString() === profileId
    );

    if (hasAccess) {
      return next();
    }
  }

  return res.status(403).json({ message: "Not authorized to access this profile." });
});

export {
  authenticate,
  authorizeHealthcareProvider,
  authorizeParentOrHealthcare,
  authorizeAdmin,
  authorizeParentAccess
};