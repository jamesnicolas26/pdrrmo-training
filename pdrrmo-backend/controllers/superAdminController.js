const User = require("../models/user");

const promoteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // role can be "admin" or "superadmin"

    if (!["Admin", "superadmin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: `User promoted to ${role}.`, user });
  } catch (error) {
    console.error("Error promoting user:", error.message);
    res.status(500).json({ message: "Error promoting user.", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error fetching users.", error });
  }
};

module.exports = { promoteUser, getAllUsers };
