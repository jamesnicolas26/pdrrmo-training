const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ["Managerial", "Supervisory", "Technical"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0 },
  sponsor: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  office: { type: String, required: true, trim: true },
  certificate: {
    data: Buffer, // Store the binary data
    contentType: String, // Store the MIME type (e.g., 'image/jpeg')
  },
}, { timestamps: true });

const Training = mongoose.model("Training", trainingSchema);

module.exports = Training;
