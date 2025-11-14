const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// =========================
// Get user profile
// =========================
router.get("/", auth, async (req, res) => {
  try {
    // req.userId comes from the fixed auth middleware
    const user = await User.findById(req.userId).select("-password"); 
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: user });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Update profile (for any role)
// =========================
router.put("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Merge new profile data with existing profile data
    const updatedProfile = {
      ...user.profile.toObject(), 
      ...req.body 
    };

    user.profile = updatedProfile;
    
    // ✅ FIX: Do NOT set user.password = undefined here. 
    // It causes validation errors on save().
    
    await user.save(); 
    
    const updatedUser = await User.findById(req.userId).select("-password"); 

    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Add experience (Candidate)
// =========================
router.post("/experience", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.profile.experience) user.profile.experience = [];
    user.profile.experience.push(req.body);
    await user.save();
    res.json({ success: true, experience: user.profile.experience });
  } catch (error) {
    console.error("Add experience error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Update experience by ID (Candidate)
// =========================
router.put("/experience/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const exp = user.profile.experience.id(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: "Experience not found" });

    Object.assign(exp, req.body);
    await user.save();
    res.json({ success: true, experience: user.profile.experience });
  } catch (error) {
    console.error("Update experience error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Delete experience by ID (Candidate)
// =========================
router.delete("/experience/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.profile.experience.pull(req.params.id);
    await user.save();
    res.json({ success: true, experience: user.profile.experience });
  } catch (error) {
    console.error("Delete experience error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Add education (Candidate)
// =========================
router.post("/education", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.profile.education) user.profile.education = [];
    user.profile.education.push(req.body);
    await user.save();
    res.json({ success: true, education: user.profile.education });
  } catch (error) {
    console.error("Add education error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Update education by ID (Candidate)
// =========================
router.put("/education/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const edu = user.profile.education.id(req.params.id);
    if (!edu) return res.status(404).json({ success: false, message: "Education not found" });

    Object.assign(edu, req.body);
    await user.save();
    res.json({ success: true, education: user.profile.education });
  } catch (error) {
    console.error("Update education error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================
// Delete education by ID (Candidate)
// =========================
router.delete("/education/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.profile.education.pull(req.params.id);
    await user.save();
    res.json({ success: true, education: user.profile.education });
  } catch (error) {
    console.error("Delete education error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;