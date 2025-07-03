require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { authenticate, authorizeAdmin } = require("./middleware/authMiddleware");
const trainingTitleRoute = require("./routes/trainingTitles");
const officeRoutes = require('./routes/officeRoutes');
const trainingRoutes = require("./routes/trainingRoutes"); // Adjust path as needed

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
const allowedOrigins = [
  "http://localhost:3000",
  "https://bulacan.gov.ph",
  "https://pdrrmo.bulacan.gov.ph",
  "https://pdrrmo.bulacan.gov.ph/pdrrmo-training",
  "https://pdrrmo.bulacan.gov.ph/wp-content/reactpress/apps/pdrrmo-training"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      console.log("✅ CORS allowed for:", origin || "Direct server call");
      callback(null, true);
    } else {
      console.error("❌ CORS not allowed for:", origin);
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// API Routes without `/api` prefix
try {
  app.use("/offices", officeRoutes);
  console.log("✅ Registered route: /offices");

  app.use("/", authRoutes);
  console.log("✅ Registered route: /auth");

  app.use("/users", authenticate, authorizeAdmin, userRoutes);
  console.log("✅ Registered route: /users");

  app.use("/training-titles", trainingTitleRoute);
  console.log("✅ Registered route: /training-titles");

  app.use("/trainings", trainingRoutes);
  console.log("✅ Registered route: /trainings");
  
} catch (err) {
  console.error("❌ Error registering routes:", err.message);
}

// Test Endpoint
app.get('/status', (req, res) => {
  console.log("✅ Status endpoint hit");
  res.json({
    status: 'ok',
    message: 'API is running',
    time: new Date().toISOString(),
  });
});

// Echo Test Endpoint
app.post('/echo', (req, res) => {
  const { message } = req.body;
  console.log("✅ Echo endpoint hit with message:", message);
  if (!message) {
    console.error("❌ Echo endpoint: Missing 'message' in request body");
    return res.status(400).json({ error: 'Message is required' });
  }
  res.json({ echo: message });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Catch-All Route for React Frontend (Optional)
// const buildPath = path.join(__dirname, "../build");
// app.use(express.static(buildPath));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(buildPath, "index.html"));
// });

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} - ${new Date().toLocaleString()}`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});
