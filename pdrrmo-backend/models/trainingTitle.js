const mongoose = require("mongoose");

// Schema for training titles
const TrainingTitleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate titles
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("TrainingTitle", TrainingTitleSchema);
