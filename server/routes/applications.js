const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Candidate = require("../models/Candidate"); 
const Submission = require("../models/Submission"); 
const protect = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const apps = await Application.find().lean();

    const submissions = await Submission.find()
      .populate("candidate") 
      .populate("position") 
      .lean();

    const normalizedSubmissions = submissions.map(sub => {
      if (!sub.candidate || !sub.position) return null;

      return {
        _id: sub.candidate._id, 
        
        candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
        email: sub.candidate.email,
        phone: sub.candidate.phone,
        
        position: sub.position.title, 
        
        status: sub.candidate.status, 
        resumeUrl: sub.candidate.resumePath,
        appliedAt: sub.createdAt,
        onboardingStatus: sub.candidate.onboardingStatus || "Pending",
        isRecruiterSubmission: true 
      };
    }).filter(item => item !== null); 

    const unifiedList = [...apps, ...normalizedSubmissions].sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json(unifiedList);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

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

const updateAnyStatus = async (id, status) => {
  let doc = await Application.findByIdAndUpdate(id, { status }, { new: true });
  
  if (!doc) {
    doc = await Candidate.findByIdAndUpdate(id, { status }, { new: true });
  }
  
  return doc;
};

router.put("/:id/review", protect, async (req, res) => {
  try {
    const updatedDoc = await updateAnyStatus(req.params.id, "Under Review");
    if (!updatedDoc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Status updated to Under Review", application: updatedDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/reject", protect, async (req, res) => {
  try {
    const updatedDoc = await updateAnyStatus(req.params.id, "Rejected");
    if (!updatedDoc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Application rejected", application: updatedDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/hire", protect, async (req, res) => {
  try {
    let doc = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: "Hired", onboardingStatus: "Pending" }, 
      { new: true }
    );

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