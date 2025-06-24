const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  middlename: { type: String, default: "" },
  office: { type: String, default: "" },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ["Member", "Admin", "superadmin"], required: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
