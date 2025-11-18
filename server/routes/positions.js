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
    const positions = await Position.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.json(positions);
  } catch (err) {
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
      requiredSkills: req.body.skills || [], 
      createdBy: userId
    };

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
    if (updateData.skills) {
        updateData.requiredSkills = updateData.skills;
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