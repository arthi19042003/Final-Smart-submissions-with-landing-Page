const express = require("express");
const router = express.Router();
const Position = require("../models/Position");
const protect = require("../middleware/auth");

// ✅ THIS ROUTE IS NOW PUBLIC (no 'protect' middleware)
router.get("/open", async (req, res) => {
  try {
    const positions = await Position.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.json(positions);
  } catch (err) {
    console.error("Error fetching open positions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 'protect' ADDED HERE: This route should be private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.userId;
    // FIX: Explicitly selecting fields to ensure requiredSkills is always included in the response payload
    const positions = await Position.find({ createdBy: userId }).select('title location requiredSkills openings status department project').sort({ createdAt: -1 });
    res.json(positions);
  } catch (err) {
    // The original code uses a simple find query
    console.error("Error fetching positions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 'protect' ADDED HERE: This route should be private
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.userId;

    const positionData = {
      ...req.body,
      // The front-end now sends the skills array directly under req.body.requiredSkills
      requiredSkills: req.body.requiredSkills || [],
      createdBy: userId
    };
    // The original POST route logic already mapped req.body.skills to requiredSkills,
    // this version uses the unified 'requiredSkills' field name.

    const newPosition = await Position.create(positionData);
    res.status(201).json(newPosition);
  } catch (err) {
    console.error("Error creating position:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ✅ 'protect' ADDED HERE: This route should be private
router.put("/:id", protect, async (req, res) => {
  try {
    const userId = req.userId;

    const updateData = { ...req.body };

    // FIX: Robustly handle conversion of the requiredSkills input (from the edit form) to an array
    if (updateData.requiredSkills || updateData.skills) {
      const skillsToProcess = updateData.requiredSkills || updateData.skills;

      if (typeof skillsToProcess === 'string') {
        // Convert comma-separated string to array
        updateData.requiredSkills = skillsToProcess.split(',').map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(skillsToProcess)) {
        // If it's already an array, clean it up
        updateData.requiredSkills = skillsToProcess.map(s => s.trim()).filter(s => s);
      } else {
        // Default to empty array if unexpected format
        updateData.requiredSkills = [];
      }

      // Clean up the old 'skills' key if present
      delete updateData.skills;
    }

    const updated = await Position.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Position not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating position:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 'protect' ADDED HERE: This route should be private
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.userId;
    const deleted = await Position.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    if (!deleted) return res.status(404).json({ message: "Position not found" });

    res.json({ message: "Position deleted" });
  } catch (err) {
    console.error("Error deleting position:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ This route isn't in your file, but if you add it, it should be protected
router.get("/:id", protect, async (req, res) => {
  try {
    const position = await Position.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    // You might want to fetch related submissions or invites here
    // For now, just sending the position
    res.json({ position });
  } catch (err) {
    console.error("Error fetching position details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;