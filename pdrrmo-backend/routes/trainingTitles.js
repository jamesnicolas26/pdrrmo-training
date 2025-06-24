const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const TrainingTitle = require("../models/trainingTitle");

// Get all training titles - accessible to all users
router.get("/", async (req, res) => {
  try {
    const titles = await TrainingTitle.find({});
    res.status(200).json(titles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching training titles" });
  }
});

// Add a new training title - restricted to superadmins
router.post("/", authenticate, authorizeRoles("superadmin"), async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Invalid title" });
  }

  try {
    const existingTitle = await TrainingTitle.findOne({ name });
    if (existingTitle) {
      return res.status(400).json({ message: "Title already exists" });
    }

    const newTitle = new TrainingTitle({ name });
    await newTitle.save();
    res.status(201).json(newTitle);
  } catch (error) {
    res.status(500).json({ message: "Error adding training title" });
  }
});

module.exports = router;
