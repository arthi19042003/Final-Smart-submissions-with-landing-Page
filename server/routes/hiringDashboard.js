const express = require("express");
const router = express.Router();
// ✅ Import 'Submission' model
const Submission = require("../models/Submission");
const Position = require("../models/Position");
const protect = require("../middleware/auth");

router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.userId; 

    // 1. Find all Jobs (Positions) created by this Hiring Manager
    const myJobs = await Position.find({ createdBy: userId }).select("_id");
    const myJobIds = myJobs.map(job => job._id);

    // 2. Build Query to find Submissions for these jobs
    const query = {
      $or: [
        { position: { $in: myJobIds } }, 
        { positionId: { $in: myJobIds } },
        { job: { $in: myJobIds } },
        { createdBy: userId } // Or candidates added manually by me
      ]
    };

    // 3. Run counts on the Submission model
    // ✅ FIX: Using regex with case-insensitive 'i' to match model statuses
    const [totalSubmissions, interviewsScheduled, offersMade, hired] = await Promise.all([
      Submission.countDocuments(query),
      
      // Matches "interviewed"
      Submission.countDocuments({ ...query, status: { $regex: "interviewed", $options: "i" } }), 
      
      // Matches "reviewed" (as a proxy for "Offer" since "offer" isn't a status)
      Submission.countDocuments({ ...query, status: { $regex: "reviewed", $options: "i" } }), 
      
      // Matches "hired"
      Submission.countDocuments({ ...query, status: { $regex: "hired", $options: "i" } }) 
    ]);

    res.json({
      totalSubmissions,
      interviewsScheduled, // This will now count "interviewed"
      offersMade: offersMade, // This will now count "reviewed"
      hired
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    // Return zeros instead of crashing if something is wrong
    res.json({
      totalSubmissions: 0,
      interviewsScheduled: 0,
      offersMade: 0,
      hired: 0
    });
  }
});

module.exports = router;