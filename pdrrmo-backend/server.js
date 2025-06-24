require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { authenticate } = require("./middleware/authMiddleware");
const trainingTitleRoute = require("./routes/trainingTitles");
const officeRoutes = require('./routes/officeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
<<<<<<< HEAD
app.use(cors({
  origin: ["http://localhost:3000", 
  "https://pdrrmo.bulacan.gov.ph",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Allows cookies and authorization headers
}));

app.options("*", cors());

 // Allow requests from the frontend
=======
app.use(cors({ origin: "https://pdrrmo.bulacan.gov.ph/pdrrmo-training/" })); // Allow requests from the frontend
>>>>>>> 21c6ebde26bb8c8c4914e84f2bfbefe7088de331
app.use(express.json());

// Serve the frontend build files
app.use(express.static(path.join(__dirname, 'build')));

// Adjust the route paths for backend API routes
app.use("/api/offices", officeRoutes);
app.use("/", authRoutes); // Handles /login and /register
app.use("/api/users", authenticate, userRoutes); // Protected user-related routes
app.use("/api/training-titles", trainingTitleRoute); // Training titles route

// Middleware for large payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Catch-All for React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
