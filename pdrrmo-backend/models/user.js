const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  title: String,
  firstname: String,
  lastname: String,
  middlename: String,
  office: String,
  username: { type: String, unique: true },
  email:   { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "Member" },
  isApproved: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

// Password hashing
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate and save reset token
userSchema.methods.createPasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

module.exports = mongoose.model("User", userSchema);
