const express = require("express");
const { loginUser, registerUser, refreshToken } = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

router.post("/refresh-token", async (req, res) => {
  const oldToken = req.headers.authorization?.split(" ")[1];

  if (!oldToken) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(oldToken, "your-secret-key");

    // Fetch user details from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a new token with user details
    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        office: user.office,
      },
      "your-secret-key",
      { expiresIn: "1h" }
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
    res.status(401).json({ message: "Invalid or expired token." });
  }
});


module.exports = router;