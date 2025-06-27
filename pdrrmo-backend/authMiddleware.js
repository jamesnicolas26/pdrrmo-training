const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate and verify token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Attach decoded data to the request
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(403).json({ message: "Authentication failed. Invalid or expired token." });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized access. User not authenticated." });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (!roles.includes(user.role.toLowerCase())) {
        return res.status(403).json({ message: "Access denied." });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      res.status(500).json({ message: "Error verifying user role." });
    }
  };
};

// Middleware to protect routes for authenticated users
const protect = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access. User not authenticated." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user; // Attach the full user object to the request
    next();
  } catch (error) {
    console.error("Protection error:", error.message);
    res.status(500).json({ message: "Error verifying user." });
  }
};

const authorizeAdmin = authorizeRoles("Admin", "superadmin");

module.exports = { authenticate, authorizeRoles, authorizeAdmin, protect };