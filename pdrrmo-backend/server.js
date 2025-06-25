require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { authenticate, authorizeAdmin } = require("./middleware/authMiddleware");
const trainingTitleRoute = require("./routes/trainingTitles");
const officeRoutes = require("./routes/officeRoutes");
const { fileURLToPath } = require("url");

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
const initializeDB = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};
initializeDB();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5000",
//   "https://bulacan.gov.ph",
//   "https://pdrrmo.bulacan.gov.ph",
//   "https://pdrrmo.bulacan.gov.ph/pdrrmo-training",
//   "https://pdrrmo.bulacan.gov.ph/wp-content/reactpress/apps/pdrrmo-training",
//   "https://pdrrmo-training.onrender.com",
//   "https://pdrrmo-training.onrender.com/pdrrmo-training",
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     console.log(`CORS request from origin: ${origin}`);
//     if (!origin || allowedOrigins.includes(origin)) {
//       console.log(`✅ Allowed CORS origin: ${origin}`);
//       callback(null, true);
//     } else {
//       console.error(`❌ Blocked CORS origin: ${origin}`);
//       callback(new Error("CORS not allowed"));
//     }
//   },
//   credentials: true,
// }));

app.use(cors({
  origin: "*", // Allow all origins
  credentials: true, // Allow cookies and authorization headers
}));

// API Routes
app.use("api/offices", officeRoutes);
app.use("api/", authRoutes);
app.use("api/users", authenticate, authorizeAdmin, userRoutes);
app.use("api/training-titles", trainingTitleRoute);

// Test Endpoints
app.get("api/status", (req, res) => {
  console.log("✅ Status endpoint hit");
  res.json({
    status: "ok",
    message: "API is running",
    time: new Date().toISOString(),
  });
});

app.post("api/echo", (req, res) => {
  const { message } = req.body;
  console.log("✅ Echo endpoint hit with message:", message);
  if (!message) {
    console.error("❌ Echo endpoint: Missing 'message' in request body");
    return res.status(400).json({ error: "Message is required" });
  }
  res.json({ echo: message });
});

app.use(express.static(path.join(__dirname,'../pdrrmo-training/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../pdrrmo-training/build/index.html'));
});


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} - ${new Date().toLocaleString()}`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});
