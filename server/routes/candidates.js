// server/routes/candidates.js
const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const Interview = require("../models/Interview");
// ✅ NEW: Import path and fs
const path = require('path');
const fs = require('fs');
const auth = require("../middleware/auth"); // ✅ NEW: Add auth

// === Get all candidates ===
router.get("/", auth, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// === ✅ NEW: Get full details for one candidate ===
router.get("/:id/details", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    const submissions = await Submission.find({ candidate: req.params.id })
      .populate("position", "title department")
      .sort({ createdAt: -1 });
      
    const interviews = await Interview.find({ candidate: req.params.id })
      .populate("position", "title")
      .sort({ date: -1 });

    res.json({ candidate, submissions, interviews });
  } catch (err) {
    console.error("Error fetching candidate details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// === ✅ NEW: Download resume for a recruiter-submitted candidate ===
router.get("/resume/:id", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resumePath) {
      return res.status(404).json({ message: "Resume not found for this candidate." });
    }

    const filePath = path.resolve(candidate.resumePath);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, candidate.resumeOriginalName);
    } else {
      res.status(404).json({ message: "Resume file not found on server." });
    }
  } catch (err) {
    console.error("Error downloading resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// === Update candidate status (Shortlist / Reject) ===
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Status updated successfully", candidate });
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;