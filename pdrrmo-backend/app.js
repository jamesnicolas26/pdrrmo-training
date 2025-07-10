require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const trainingTitleRoute = require("./routes/trainingTitles");
const officeRoutes = require("./routes/officeRoutes");
const trainingRoutes = require("./routes/trainingRoutes")

const { authenticate, protect, authorizeAdmin } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect to Database
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();

// ✅ Security Middleware
app.use(helmet());

// ✅ JSON & URL-encoded Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // ✅ CORS Configuration
const allowedOrigins = [
  "https://bulacan.gov.ph",
  "https://pdrrmo.bulacan.gov.ph",
  "https://pdrrmo.bulacan.gov.ph/pdrrmo-training",
  "https://pdrrmo.bulacan.gov.ph/wp-content/reactpress/apps/pdrrmo-training",
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
app.options("*", cors(corsOptions)); // ✅ Handle pre-flight requests

// app.use(cors({
//   origin: "*", // Allow all origins
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// ✅ API Routes
app.use("/offices", officeRoutes);
console.log("✅ Registered route: /offices");

app.use("/", authRoutes);
console.log("✅ Registered route: /auth");

app.use("/users", authenticate, protect, userRoutes);
console.log("✅ Registered route: /users");

app.use("/training-titles", trainingTitleRoute);
console.log("✅ Registered route: /training-titles");

app.use("/trainings", trainingRoutes);

// ✅ Test Endpoints
app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.post("/echo", (req, res) => {
  const { message } = req.body;
  console.log("✅ Echo endpoint hit with message:", message);
  if (!message) {
    console.error("❌ Echo endpoint: Missing 'message' in request body");
    return res.status(400).json({ error: "Message is required" });
  }
  res.json({ echo: message });
});

// ✅ Root HTML
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>PDRRMO API</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 2rem; line-height: 1.6; }
          h1 { color: #2c3e50; }
          ul { padding-left: 1rem; }
        </style>
      </head>
      <body>
        <h1>✅ Welcome to the PDRRMO API</h1>
        <p>This API provides access to training, office, and user management endpoints.</p>
        <p><strong>Available routes:</strong></p>
        <ul>
          <li><a href="/status">/status</a></li>
          <li><a href="/echo">/echo</a> (POST only)</li>
          <li><a href="/auth">/auth</a></li>
          <li><a href="/users">/users</a></li>
          <li><a href="/offices">/offices</a></li>
          <li><a href="/training-titles">/training-titles</a></li>
        </ul>
        <p><em>Time: ${new Date().toLocaleString()}</em></p>
      </body>
    </html>
  `);
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.stack || err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ React Frontend Fallback (Optional)
const buildPath = path.join(__dirname, "../build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} - ${new Date().toLocaleString()}`);
});

// ✅ Process Safety
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;
