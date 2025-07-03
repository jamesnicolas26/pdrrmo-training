const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Helper function to generate a token
const generateToken = (userId, role, firstname, lastname, office) => {
  const secretKey = process.env.SECRET_KEY || "aad96d99fd8ed30865caec96d6c1adfda41949948da88af3b448ce232ce36597";
  const token = jwt.sign(
    { id: userId, role, firstname, lastname, office },
    secretKey,
    { expiresIn: "1h" }
  );
  return token;
};


// Login Logic
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Username/email and password are required." });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(
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
  const { title, lastname, firstname, middlename, office, username, email, role, password } = req.body;

  if (!title || !lastname || !firstname || !username || !email || !role || !password) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(409).json({ message: "Username or email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isApproved = role === "Admin"; // Automatically approve admin users

    const newUser = new User({
      title,
      lastname,
      firstname,
      middlename,
      office,
      username,
      email,
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
    const decoded = jwt.verify(oldToken, process.env.SECRET_KEY || "aad96d99fd8ed30865caec96d6c1adfda41949948da88af3b448ce232ce36597");

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No user with that email" });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `Reset your password:\n\n${resetUrl}\n\nIf you didn't request this, ignore.`;
  await sendEmail({ to: user.email, subject: "Password Reset", text: message });

  res.json({ message: "Reset email sent" });
};

const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: "Token invalid or expired" });


  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};

module.exports = { loginUser, registerUser, refreshToken, forgotPassword, resetPassword };