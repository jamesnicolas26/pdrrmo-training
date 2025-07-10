const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

const protect = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access. User not authenticated." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Merge full user info without overwriting the existing token data
    req.user = {
      ...req.user, // includes id and role from token
      firstname: user.firstname,
      lastname: user.lastname,
      office: user.office,
      // Add anything else you want from DB
    };

    next();
  } catch (error) {
    console.error("Protection error:", error.message);
    res.status(500).json({ message: "Error verifying user." });
  }
};

const authorizeAdmin = authorizeRoles("Admin", "superadmin");

module.exports = { authenticate, authorizeRoles, authorizeAdmin, protect };
