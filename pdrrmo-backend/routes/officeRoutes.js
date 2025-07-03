const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const Office = require("../models/Office"); // Replace with your Office model

// Public route: Fetch all offices
router.get("/", async (req, res) => {
  try {
    const offices = await Office.find(); // Fetch all offices from the database
    res.status(200).json({ offices });
  } catch (error) {
    console.error("Error fetching offices:", error.message);
    res.status(500).json({ message: "Failed to fetch offices." });
  }
});

// Protected route: Add a new office (SuperAdmin only)
router.post("/", authenticate, authorizeRoles("superadmin"), async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ message: "Office name is required." });
    }
  
    try {
      // Check if the office already exists
      const existingOffice = await Office.findOne({ name });
      if (existingOffice) {
        return res.status(400).json({ message: "Office already exists." });
      }
  
      // Add the new office
      const newOffice = new Office({ name });
      await newOffice.save();
  
      res.status(201).json({ message: "Office added successfully.", office: newOffice });
    } catch (error) {
      console.error("Error adding office:", error.message);
      res.status(500).json({ message: "Failed to add office." });
    }
  });

  module.exports = router;