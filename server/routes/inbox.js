const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User"); 
const protect = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const email = user.email;
    
    let query = { to: email };

    const isManager = user.role === 'employer' || user.role === 'hiringManager';
    
    if (isManager) {
        query = { $or: [{ to: email }, { to: "System" }] };
    }

    const messages = await Message.find(query).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Inbox fetch error:", err.message);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["read", "unread"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }
    
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Status updated", updatedMessage });
  } catch (err) {
    console.error("Error updating message status:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 