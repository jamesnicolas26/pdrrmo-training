const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Helper function to generate a token
const generateToken = (userId, role, firstname, lastname, office) => {
  const secretKey = process.env.SECRET_KEY;
  return jwt.sign({ id: userId, role, firstname, lastname, office }, secretKey, {
    expiresIn: "1h",
  });
};

// Login Logic
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  console.log("🟨 Login attempt");
  console.log("Identifier received:", identifier);
  console.log("Password received:", password);

  if (!identifier || !password) {
    return res.status(400).json({ message: "Username/email and password are required." });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    console.log("🟩 User found:", user); // <== Check this

    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🟪 Password valid:", isPasswordValid);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

    // Only allow login if approved OR admin/superadmin
    if (!user.isApproved && user.role !== "Admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Your account is not approved by an admin yet." });
    }

    const token = generateToken(user._id, user.role, user.firstname, user.lastname, user.office);

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      office: user.office,
      role: user.role,
      isApproved: user.isApproved,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
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
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token required." });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const newToken = generateToken(user._id, user.role, user.firstname, user.lastname, user.office);

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      office: user.office,
      role: user.role,
      token: newToken,
    });
  } catch (err) {
    console.error("Refresh error:", err);
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