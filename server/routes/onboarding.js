const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
// ✅ Fix Import
const protect = require("../middleware/auth"); 

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const onboarded = await Application.find({ createdBy: userId, status: "Hired" }).sort({ appliedAt: -1 });
    res.json(onboarded);
  } catch (err) {
    console.error("Error fetching onboarding:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const { onboardingStatus } = req.body;
    const userId = req.user.id || req.user._id;
    const updated = await Application.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      { onboardingStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Candidate not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;