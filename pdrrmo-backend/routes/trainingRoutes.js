const express = require("express");
const Training = require("../models/Training"); // Adjust the path based on your project structure
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// GET all trainings with pagination
// GET /trainings?page=1&limit=10&type=Technical&sortBy=title&order=asc
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filters from query
    if (req.query.type) filter.type = req.query.type;

    if (req.query.year) {
      const year = parseInt(req.query.year);
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year + 1}-01-01`);
      filter.startDate = { $gte: start, $lt: end };
    }

    if (req.query.office) filter.office = { $regex: req.query.office, $options: "i" };
    if (req.query.author) filter.author = { $regex: req.query.author, $options: "i" };
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

    // 🛡️ Role-based filtering
    let role = null;
    let firstname = null;
    let lastname = null;

    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        role = decoded.role;
        firstname = decoded.firstname;
        lastname = decoded.lastname;
      }
    } catch (err) {
      console.error("JWT decode failed:", err.message);
      return res.status(401).json({ error: "Invalid or missing token" });
    }

    if (role === "Member") {
      filter.author = `${lastname}, ${firstname}`;
    }

    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.order === "desc" ? -1 : 1;
    }

    const total = await Training.countDocuments(filter);
    const trainings = await Training.find(filter).sort(sort).skip(skip).limit(limit);

    const transformed = trainings.map((t) => {
      const obj = t.toObject();
      obj.certificate = obj.certificate?.data
        ? `data:${obj.certificate.contentType};base64,${obj.certificate.data.toString("base64")}`
        : "";
      return obj;
    });

    res.json({
      trainings: transformed,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Failed to fetch trainings" });
  }
});

// GET a single training by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ error: "Training not found" });

    const obj = training.toObject();

    if (obj.certificate?.data) {
      obj.certificate = `data:${obj.certificate.contentType};base64,${obj.certificate.data.toString("base64")}`;
    } else {
      obj.certificate = "";
    }

    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch training" });
  }
});

// POST a new training
router.post("/", async (req, res) => {
  try {
    const { certificate, ...rest } = req.body;
    const trainingData = { ...rest };

    // Handle base64 certificate
    if (certificate && certificate.startsWith("data:")) {
      const matches = certificate.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const [, contentType, base64Data] = matches;
        trainingData.certificate = {
          data: Buffer.from(base64Data, "base64"),
          contentType,
        };
      }
    }

    const training = new Training(trainingData);
    await training.save();
    res.status(201).json(training);
  } catch (error) {
    res.status(400).json({ error: "Failed to add training", details: error.message });
  }
});

// PUT (update) a training by ID
router.put("/:id", validateObjectId, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ error: "Training not found" });

    const { certificate, ...rest } = req.body;

    // Update basic fields
    Object.assign(training, rest);

    // If a new base64 certificate is sent
    if (certificate && certificate.startsWith("data:")) {
      const matches = certificate.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const [, contentType, base64Data] = matches;
        training.certificate = {
          data: Buffer.from(base64Data, "base64"),
          contentType,
        };
      }
    }

    await training.save();
    res.status(200).json(training);
  } catch (error) {
    res.status(400).json({ error: "Failed to update training", details: error.message });
  }
});


// DELETE a training by ID
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const deletedTraining = await Training.findByIdAndDelete(req.params.id);
    if (!deletedTraining) return res.status(404).json({ error: "Training not found" });
    res.status(200).json({ message: "Training deleted successfully", deletedTraining });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete training" });
  }
});

module.exports = router;
