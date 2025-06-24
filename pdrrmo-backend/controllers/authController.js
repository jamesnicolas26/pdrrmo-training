const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Helper function to generate a token
const generateToken = (userId, role, firstname, lastname, office) => {
  const secretKey = process.env.SECRET_KEY || "your-secret-key";
  const token = jwt.sign(
    { id: userId, role, firstname, lastname, office },
    secretKey,
    { expiresIn: "1h" }
  );
  return token;
};


// Login Logic
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

    // Generate a new token
    const token = generateToken
    (
      user._id,
      user.role,
      user.firstname,
      user.lastname,
      user.office
    );

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      office: user.office, 
      token, 
      isApproved: user.isApproved, 
      role: user.role
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in." });
  }
};

// Register Logic
const registerUser = async (req, res) => {
  const { title, lastname, firstname, middlename, office, username, role, password } = req.body;

  if (!title || !lastname || !firstname || !username || !role || !password) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(409).json({ message: "Username already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isApproved = role === "Admin"; // Automatically approve admin users

    const newUser = new User({
      title,
      lastname,
      firstname,
      middlename,
      office,
      username,
      role,
      password: hashedPassword,
      isApproved,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user." });
  }
};

// Refresh Token Logic
const refreshToken = async (req, res) => {
  const oldToken = req.headers.authorization?.split(" ")[1];

  if (!oldToken) {
    return res.status(400).json({ message: "Token required." });
  }

  try {
    const decoded = jwt.verify(oldToken, process.env.SECRET_KEY || "your-secret-key");

    // Fetch user details from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a new token with user details
    const newToken = generateToken(
      user._id,
      user.role
    );

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      office: user.office,
      token: newToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};


module.exports = { loginUser, registerUser, refreshToken };