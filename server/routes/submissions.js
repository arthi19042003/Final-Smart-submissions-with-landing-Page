// server/routes/submissions.js
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const protect = require("../middleware/auth");

// ✅ POST - Handle Candidate Application
router.post("/", protect, async (req, res) => {
  try {
    const { jobId, positionTitle, resumeUrl } = req.body;
    const candidateId = req.user.id || req.user._id;
    
    // ✅ FIX: Correctly extract name from the nested profile object
    // req.user is populated by the auth middleware from the User model
    const profile = req.user.profile || {};
    const candidateName = (profile.firstName && profile.lastName) 
      ? `${profile.firstName} ${profile.lastName}` 
      : (profile.firstName || req.user.email); // Fallback to email if name missing

    const candidateEmail = req.user.email;

    // Create new Application
    const newApplication = new Application({
      jobId: jobId,
      position: positionTitle,
      candidateName: candidateName, // This will now save the correct name
      email: candidateEmail,
      resumeUrl: resumeUrl,
      status: "Applied",
      createdBy: candidateId,
      appliedAt: new Date()
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ GET - Candidate's own submissions
router.get("/my-submissions", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const subs = await Application.find({ createdBy: userId });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;