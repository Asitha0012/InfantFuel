import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

// Middleware to authenticate the user
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to req.user (excluding the password)
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        console.log("Auth failed: User not found");
        res.status(404);
        throw new Error("User not found.");
      }
      
      console.log("Authenticated user:", {
        id: req.user._id,
        isAdmin: req.user.isAdmin
      });

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token provided.");
  }
});

// Middleware to authorize admin users
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error("Not authorized as an admin.");
  }
};

export { authenticate, authorizeAdmin };