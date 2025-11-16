// server/routes/applications.js
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Candidate = require("../models/Candidate"); 
const Submission = require("../models/Submission"); // ✅ Import Submission Model
const protect = require("../middleware/auth");

// ============================================================
// ✅ GET All Applications (Merged: Direct Apps + Recruiter Submissions)
// ============================================================
router.get("/", protect, async (req, res) => {
  try {
    // 1. Fetch Direct Applications
    const apps = await Application.find().lean();

    // 2. Fetch Recruiter Submissions via Submission Model
    // We fetch Submissions to access the linked 'Position' details
    const submissions = await Submission.find()
      .populate("candidate") // Get Candidate details
      .populate("position")  // Get Position details (Title!)
      .lean();

    // 3. Normalize Submission Data to match Application Structure
    const normalizedSubmissions = submissions.map(sub => {
      // Safety check: if candidate or position was deleted
      if (!sub.candidate || !sub.position) return null;

      return {
        // We use the Candidate ID for actions because your PUT routes update the Candidate model
        _id: sub.candidate._id, 
        
        candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
        email: sub.candidate.email,
        phone: sub.candidate.phone,
        
        // ✅ FIX: Get title from the populated Position object
        position: sub.position.title, 
        
        status: sub.candidate.status, // Use status from Candidate document
        resumeUrl: sub.candidate.resumePath,
        appliedAt: sub.createdAt,
        onboardingStatus: sub.candidate.onboardingStatus || "Pending",
        isRecruiterSubmission: true 
      };
    }).filter(item => item !== null); // Filter out any nulls (orphaned submissions)

    // 4. Merge and Sort by Date (Newest First)
    const unifiedList = [...apps, ...normalizedSubmissions].sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json(unifiedList);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// ✅ GET Candidate History (Search in both collections)
// ============================================================
router.get("/history/:email", protect, async (req, res) => {
  try {
    const email = req.params.email;
    
    const appHistory = await Application.find({ email }).lean();
    const candHistory = await Candidate.find({ email }).lean();

    const unifiedHistory = [
      ...appHistory,
      ...candHistory.map(c => ({
        ...c,
        candidateName: `${c.firstName} ${c.lastName}`,
        resumeUrl: c.resumePath,
        appliedAt: c.createdAt
      }))
    ].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    
    res.json(unifiedHistory);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🟢 STATUS UPDATES (Handles both Application & Candidate IDs)
// ============================================================

// Helper to find and update either Application or Candidate
const updateAnyStatus = async (id, status) => {
  // Try Application first
  let doc = await Application.findByIdAndUpdate(id, { status }, { new: true });
  
  // If not found, try Candidate
  if (!doc) {
    doc = await Candidate.findByIdAndUpdate(id, { status }, { new: true });
  }
  
  return doc;
};

// ✅ PUT - Mark as Under Review
router.put("/:id/review", protect, async (req, res) => {
  try {
    const updatedDoc = await updateAnyStatus(req.params.id, "Under Review");
    if (!updatedDoc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Status updated to Under Review", application: updatedDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT - Reject
router.put("/:id/reject", protect, async (req, res) => {
  try {
    const updatedDoc = await updateAnyStatus(req.params.id, "Rejected");
    if (!updatedDoc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Application rejected", application: updatedDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT - Hire
router.put("/:id/hire", protect, async (req, res) => {
  try {
    // Try Application
    let doc = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: "Hired", onboardingStatus: "Pending" }, 
      { new: true }
    );

    // Try Candidate if Application not found
    if (!doc) {
      doc = await Candidate.findByIdAndUpdate(
        req.params.id, 
        { status: "Hired", onboardingStatus: "Pending" }, 
        { new: true }
      );
    }

    if (!doc) return res.status(404).json({ message: "Record not found" });
    
    res.json({ message: "Candidate hired! Onboarding started.", application: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;