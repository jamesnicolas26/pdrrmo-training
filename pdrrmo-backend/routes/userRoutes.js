const express = require("express");
const {
  getAllUsers,
  approveUser,
  deleteUser,
  getUserById,
  updateUserById, // Controller for editing a user
} = require("../controllers/userController");
const { authenticate, authorizeAdmin, protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (admin and superadmin)
router.get("/", authenticate, getAllUsers);

// Approve a user by ID (admin and superadmin)
router.put("/approve/:id", authenticate, authorizeAdmin, approveUser);

// Edit a user by ID
router.put("/:id", authenticate, protect, updateUserById);

// Get a single user by ID
router.get("/:id", authenticate, protect, getUserById);

// Delete a user by ID (admin and superadmin)
router.delete("/:id", authenticate, authorizeAdmin, deleteUser);

module.exports = router;
