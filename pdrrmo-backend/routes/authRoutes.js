const express = require("express");
const { loginUser, registerUser, forgotPassword, resetPassword } = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("✅ PDRRMO Auth API is online");
});
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/login", loginUser);
router.post("/register", registerUser);

router.post("/refresh-token", async (req, res) => {
  const oldToken = req.headers.authorization?.split(" ")[1];

  if (!oldToken) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    console.log("Received token:", oldToken);
    const decoded = jwt.verify(oldToken, process.env.SECRET_KEY);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        office: user.office,
      },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      office: user.office,
      token: newToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;
