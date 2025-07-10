const User = require("../models/user"); // Ensure the correct model is imported
const mongoose = require("mongoose");

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users except passwords
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error fetching users." });
  }
};

// Approve a user
const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user to approved
    user.isApproved = true;
    await user.save();

    res.status(200).json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("Approve User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a user by ID (for editing purposes)
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    const requesterId = requester.id || requester._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // 🔒 Only allow members to access their own profile
    if (
      requester.role === "Member" &&
      !new mongoose.Types.ObjectId(userId).equals(requesterId)
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const user = await User.findById(userId, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Error fetching user." });
  }
};

// Update a user by ID
const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    const requesterId = requester.id || requester._id;

    // 🔒 Only allow members to update their own profile
    if (
      requester.role === "Member" &&
      !new mongoose.Types.ObjectId(userId).equals(requesterId)
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const updates = {
      title: req.body.title,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      middlename: req.body.middlename,
      office: req.body.office,
      username: req.body.username,
      email: req.body.email,
    };

    // Only Admins or Superadmins can update role
    if (requester.role !== "Member" && req.body.role) {
      updates.role = req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllUsers,
  approveUser,
  deleteUser,
  getUserById, // Export new method
  updateUserById, // Export new method
};
