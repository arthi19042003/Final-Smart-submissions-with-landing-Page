// server/routes/manager.js
const express = require("express");
const router = express.Router();
const Position = require("../models/Position");
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const Interview = require("../models/Interview"); // Make sure this model is correctly imported
const PurchaseOrder = require("../models/PurchaseOrder");
const Onboarding = require("../models/Onboarding");
// Removed protect middleware import, assuming it's applied globally in server.js

// --- Summary stats for dashboard --- (Moved from managerRoutes.js)
router.get("/summary", async (req, res) => {
  try {
    // Ensure the Interview model has 'status' and 'result' fields as used here
    const totalInterviews = await Interview.countDocuments();
    const upcoming = await Interview.countDocuments({ status: "upcoming" }); // Ensure 'upcoming' is a valid status
    const completed = await Interview.countDocuments({ status: "completed" }); // Ensure 'completed' is a valid status
    const passed = await Interview.countDocuments({ result: "Pass" });       // Ensure 'Pass' is a valid result
    const failed = await Interview.countDocuments({ result: "Fail" });       // Ensure 'Fail' is a valid result
    const pending = await Interview.countDocuments({ result: "Pending" });   // Ensure 'Pending' is a valid result

    res.json({
      totalInterviews,
      upcoming,
      completed,
      passed,
      failed,
      pending,
    });
  } catch (err) {
    console.error("Error fetching manager summary:", err.message);
    res.status(500).json({ message: "Server error fetching summary", error: err.message });
  }
});

// --- All interviews (renamed from candidates for clarity) --- (Moved from managerRoutes.js)
router.get("/interviews", async (req, res) => { // Changed path from /candidates to /interviews
  try {
    // Populate related data if needed, adjust field names based on Interview model
    const interviews = await Interview.find()
      .populate('candidate', 'name email') // Example population
      .populate('position', 'title')       // Example population
      .sort({ date: -1 });

     // Transform data to match client expectations if necessary (e.g., candidateName, interviewerName)
     const transformedInterviews = interviews.map(interview => ({
       _id: interview._id,
       candidateName: interview.candidate?.name || 'N/A', // Adjust based on actual model structure
       interviewerName: interview.interviewer || 'N/A', // Adjust based on actual model structure
       date: interview.date,
       result: interview.result || 'Pending', // Provide default if needed
       status: interview.status,
       rating: interview.rating, // Ensure this field exists in your model
       // Add other necessary fields
     }));


    res.json(transformedInterviews); // Send transformed data
  } catch (err) {
    console.error("Error fetching manager interviews:", err.message);
    res.status(500).json({ message: "Server error fetching interviews", error: err.message });
  }
});


// --- Original manager.js routes ---

// Original dashboard route - might conflict with /summary, decide which one to keep or rename
router.get("/dashboard", async (req, res) => {
  try {
    const [positions, candidates, interviews] = await Promise.all([
      Position.countDocuments(),
      Candidate.countDocuments(),
      Interview.countDocuments(), // Assumes Interview model exists
    ]);
    res.json({ positions, candidates, interviews });
  } catch (err) {
    console.error("Error fetching manager dashboard counts:", err.message);
    res.status(500).json({ message: "Server error fetching dashboard counts", error: err.message });
  }
});


router.get("/positions", async (req, res) => {
  try {
    const { project, department, skills } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (department) filter.department = department;
    if (skills) filter.skills = { $in: skills.split(",") };
    const positions = await Position.find(filter);
    res.json(positions);
  } catch (err) {
      console.error("Error fetching manager positions:", err.message);
      res.status(500).json({ message: "Server error fetching positions", error: err.message });
  }
});

router.post("/submission/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    // Validate input status against Submission model enum if applicable
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Submission not found" });

    sub.status = status;
    // Ensure history is an array before pushing
    if (!Array.isArray(sub.history)) {
      sub.history = [];
    }
    sub.history.push({ status, note, date: new Date() }); // Add date explicitly
    await sub.save();
    res.json(sub);
  } catch (err) {
      console.error("Error updating submission status:", err.message);
      res.status(500).json({ message: "Server error updating status", error: err.message });
  }
});

module.exports = router;