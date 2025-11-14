// server/routes/applications.js
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Position = require("../models/Position");
const protect = require("../middleware/auth");

// ✅ GET all applications
router.get("/", protect, async (req, res) => {
  try {
    // Fetch ALL applications sorted by newest first
    const applications = await Application.find().sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET candidate history
router.get("/history/:email", protect, async (req, res) => {
  try {
    const history = await Application.find({
      email: req.params.email
    }).sort({ appliedAt: -1 });
    
    res.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🟢 STATUS UPDATES (Review, Hire, Reject)
// ============================================================

// ✅ [FIX ADDED] PUT - Mark application as Under Review
router.put("/:id/review", protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "Under Review";
    await application.save();
    
    res.json({ message: "Application is now under review", application });
  } catch (err) {
    console.error("Error reviewing application:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT - Reject an application
router.put("/:id/reject", protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "Rejected";
    await application.save();
    
    res.json({ message: "Application rejected", application });
  } catch (err) {
    console.error("Error rejecting application:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT - Hire a candidate (This STARTS the Onboarding process)
router.put("/:id/hire", protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 1. Update Status
    application.status = "Hired";
    
    // 2. Trigger Onboarding
    application.onboardingStatus = "Pending"; 
    
    await application.save();
    
    res.json({ message: "Candidate hired! Onboarding started.", application });
  } catch (err) {
    console.error("Error hiring application:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST - Send a message (For the Inbox feature)
router.post("/:id/message", protect, async (req, res) => {
  try {
    const { message, from } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) return res.status(404).json({ message: "App not found" });

    application.communication.push({
      from: from || "Hiring Manager",
      message,
      timestamp: new Date()
    });

    await application.save();
    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;