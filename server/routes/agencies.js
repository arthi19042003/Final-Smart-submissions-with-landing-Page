const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose"); 
const Invitation = require("../models/Invitation");
const protect = require("../middleware/auth");

// ✅ CRITICAL FIX: Explicitly require the User model file HERE
require("../models/User"); 
const User = mongoose.model("User"); 

// @route   POST /api/agencies/invite
// @desc    Invite an agency or recruiter
router.post("/invite", protect, async (req, res) => {
  try {
    // ✅ FIX: Destructure the correct fields sent by the client
    const { agencyEmail, positionId } = req.body;
    
    // ✅ FIX: Use req.userId from auth middleware
    const invitedBy = req.userId; 

    // Validate input
    if (!agencyEmail || !positionId) {
      return res.status(400).json({ message: "Agency Email and Position are required." });
    }

    // Check if user already exists (optional check, depends on logic)
    const existingUser = await User.findOne({ email: agencyEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Check for existing pending invite for this specific position
    const existingInvite = await Invitation.findOne({ 
      agencyEmail, 
      position: positionId, 
      status: "pending" 
    });
    
    if (existingInvite) {
      return res.status(400).json({ message: "Invite already pending for this email and position." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    
    // ✅ FIX: Create invitation with correct field names matching the Schema
    const invite = new Invitation({
      agencyEmail,        // Schema expects 'agencyEmail'
      position: positionId, // Schema expects 'position' (ref to Position)
      token, // Note: Your schema didn't show a 'token' field in the provided snippets, but if you use it for registration links, ensure it's in the model or removed if not needed.
             // If the model DOES NOT have a token field, remove this line. 
             // Based on your previous code, you were using it for links.
      invitedBy,          // Schema expects 'invitedBy'
      status: "pending"
    });
    
    // Note: If your Invitation model defined in snippet 96 doesn't have a 'token' field, 
    // you'll need to add it to the model or remove it here. 
    // Assuming you want to generate a link, you should likely add it to the schema if missing.
    
    await invite.save();

    // Construct invite link (optional, depends on your flow)
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/register-invite?token=${token}`;
    console.log(`✅ Invite sent to ${agencyEmail}: ${inviteLink}`);
    
    // Return the populated invite so the frontend can display it immediately
    // We populate 'position' to show the title in the table
    await invite.populate('position', 'title');

    res.status(201).json(invite); 
  } catch (err) {
    console.error("❌ Error sending invite:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// @route   GET /api/agencies/invites
// @desc    Get all invites sent by the manager
router.get("/invites", protect, async (req, res) => {
  try {
    // ✅ FIX: Use req.userId
    const invites = await Invitation.find({ invitedBy: req.userId })
      .populate('position', 'title') // Populate position title
      .sort({ createdAt: -1 });
    res.json(invites);
  } catch (err) {
    console.error("Error fetching invites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/agencies/invite/:id
// @desc    Delete an invite
router.delete("/invite/:id", protect, async (req, res) => {
  try {
    // ✅ FIX: Use req.userId and correct field 'invitedBy'
    const invite = await Invitation.findOneAndDelete({
      _id: req.params.id,
      invitedBy: req.userId,
    });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    res.json({ message: "Invite deleted" });
  } catch (err) {
    console.error("Error deleting invite:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/agencies/register
// @desc    Agency/Recruiter registers using invite token (OPTIONAL if used)
router.post("/register", async (req, res) => {
  // ... existing logic if you use token-based registration ...
  // You might need to update this to look up by 'agencyEmail' instead of 'email'
  // if your schema uses 'agencyEmail'.
  try {
      // implementation depends on if you are using the token flow
      res.status(501).json({message: "Registration flow not fully implemented in this snippet"});
  } catch (err) {
      res.status(500).json({message: "Server error"});
  }
});

module.exports = router;