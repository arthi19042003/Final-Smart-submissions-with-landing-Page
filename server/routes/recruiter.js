// [File: arthi19042003/with-landing-page/With-landing-page-0f24402f43f461a8bca04af752e98da1034a70d5/server/routes/recruiter.js]
// server/routes/recruiter.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Message = require("../models/Message");

// ✅ NEW: Import multer and file system utils
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ✅ NEW: Setup multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/recruiter_resumes';
    fs.mkdirSync(uploadDir, { recursive: true }); // Create dir if not exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + path.extname(file.originalname)),
});
const resumeUpload = multer({ storage: resumeStorage });

// ====================================================
// @route   POST /api/recruiter/submit
// @desc    Recruiter submits a candidate for a position
// @access  Protected (Recruiter)
//
// ✅ UPDATED: Now uses resumeUpload.single('resume')
// ====================================================
router.post("/submit", auth, resumeUpload.single('resume'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      rate,
      currentLocation,
      availability,
      skypeId,
      githubProfile,
      linkedinProfile,
      positionId, 
      hiringManagerId,
      // ✅ FIX 1: Get company and hiringManager from req.body
      company,
      hiringManager,
    } = req.body;

    if (!email || !positionId || !firstName || !hiringManagerId) {
      return res.status(400).json({ message: "First Name, Email, Position, and Hiring Manager are required." });
    }
    
    // ✅ NEW: Check for file
    if (!req.file) {
      return res.status(400).json({ message: "A resume file is required for submission." });
    }

    // 1. Find or create the candidate
    let candidate = await Candidate.findOne({ email: email.toLowerCase() });
    if (!candidate) {
      candidate = new Candidate({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        rate,
        currentLocation,
        availability,
        skypeId,
        githubProfile,
        linkedinProfile,
        status: "Submitted",
        submittedByRecruiter: req.userId,
        resumePath: req.file.path, // ✅ NEW
        resumeOriginalName: req.file.originalname, // ✅ NEW
        // ✅ FIX 2: Add the new fields
        company: company,
        hiringManager: hiringManager,
      });
    } else {
      // If candidate exists, update their info
      candidate.set({
        firstName,
        lastName,
        phone,
        rate,
        currentLocation,
        availability,
        skypeId,
        githubProfile,
        linkedinProfile,
        status: "Submitted", // Reset status for new submission
        submittedByRecruiter: req.userId,
        resumePath: req.file.path, // ✅ NEW
        resumeOriginalName: req.file.originalname, // ✅ NEW
        // ✅ FIX 3: Add the new fields
        company: company,
        hiringManager: hiringManager,
      });
    }
    await candidate.save();

    // 2. Check for duplicate submission
    const existingSubmission = await Submission.findOne({
      candidate: candidate._id,
      position: positionId,
    });

    if (existingSubmission) {
      return res.status(409).json({ message: "This candidate has already been submitted for this position." });
    }

    // 3. Create the new Submission
    const submission = new Submission({
      candidate: candidate._id,
      position: positionId,
      submittedBy: req.userId,
      status: "submitted",
    });
    await submission.save();

    // 4. Send a message to the Hiring Manager's Inbox
    // ... (existing message logic) ...
    const manager = await User.findById(hiringManagerId);
    if (manager) {
      const recruiter = await User.findById(req.userId);
      await Message.create({
        to: manager.email,
        from: recruiter.profile.agencyName || recruiter.email,
        subject: `New Candidate Submission: ${firstName} ${lastName}`,
        message: `${recruiter.profile.firstName || 'Recruiter'} has submitted ${firstName} ${lastName} for position ID ${positionId}.`,
        status: "unread",
      });
    }

    res.status(201).json({ message: "Candidate submitted successfully!", submission });

  } catch (error) {
    console.error("Recruiter submission error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// ====================================================
// @route   GET /api/recruiter/managers
// @desc    Get all hiring managers AND RECRUITERS
// @access  Protected (Recruiter)
// ====================================================
router.get("/managers", auth, async (req, res) => {
    try {
        // ✅ UPDATED: Find managers OR recruiters
        const managers = await User.find({ 
          role: { $in: ['hiringManager', 'recruiter'] } 
        }).select('profile.firstName profile.lastName profile.agencyName email role');
        res.json(managers);
    } catch (error) {
        console.error("Error fetching managers:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;