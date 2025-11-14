// server/routes/inbox.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User"); // ✅ Import User model

// ✅ Get messages for the logged-in user
router.get("/", async (req, res) => {
  try {
    // ✅ FIX: Fetch the user from the database using the ID from the token
    // The token payload (req.user) only contains userId, not the email.
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const email = user.email;
    console.log("📬 Fetching inbox messages for:", email);

    // Find messages where 'to' matches the user's email
    const messages = await Message.find({ to: email }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Inbox fetch error:", err.message);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;