const express = require("express");
const Training = require("../models/Training"); // Adjust the path based on your project structure
const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// GET all trainings
// GET all trainings
router.get("/", async (req, res) => {
  try {
    const trainings = await Training.find();

    const transformed = trainings.map((training) => {
      const obj = training.toObject();

      if (obj.certificate?.data) {
        obj.certificate = `data:${obj.certificate.contentType};base64,${obj.certificate.data.toString("base64")}`;
      } else {
        obj.certificate = "";
      }

      return obj;
    });

    res.status(200).json(transformed);
  } catch (error) {
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
