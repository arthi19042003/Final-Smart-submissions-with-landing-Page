const express = require("express");
const router = express.Router();
const multer = require("multer");
const Interview = require("../models/Interview");
// ✅ Import these models to enable notifications
const Message = require("../models/Message");
const Position = require("../models/Position");
const User = require("../models/User");

// ✅ File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Helper Function to Notify Manager ---
const notifyHiringManager = async (data) => {
  // 1. Check if notification is requested (handle boolean or string 'true')
  if (data.notifyManager !== "true" && data.notifyManager !== true) return;

  try {
    console.log("🔔 Notification requested for:", data.jobPosition);

    // 2. Find the Position to identify the Hiring Manager (Creator)
    // Note: This relies on the 'jobPosition' text matching a Position 'title' exactly.
    const position = await Position.findOne({ title: data.jobPosition });
    
    if (!position || !position.createdBy) {
      console.warn(`⚠️ Position "${data.jobPosition}" not found or has no creator. Notification skipped.`);
      return;
    }

    // 3. Find the Manager's email
    const manager = await User.findById(position.createdBy);
    if (!manager || !manager.email) {
      console.warn("⚠️ Hiring Manager user not found.");
      return;
    }

    // 4. Construct the Message
    const subject = `Interview Update: ${data.candidateFirstName} ${data.candidateLastName}`;
    const messageBody = `
      Interview Status Update
      -----------------------
      Candidate: ${data.candidateFirstName} ${data.candidateLastName}
      Position: ${data.jobPosition}
      Interviewer: ${data.interviewerName}
      
      Status: ${data.status}
      Result: ${data.result}
      Rating: ${data.rating}/5
      
      Feedback: ${data.feedback || "No feedback provided."}
    `;

    // 5. Save Message to Database (Inbox)
    await Message.create({
      to: manager.email,       
      from: "System",          
      subject: subject,
      message: messageBody,
      status: "unread",
      relatedId: data._id      
    });

    console.log(`✅ Notification sent to ${manager.email} (Inbox)`);

  } catch (err) {
    console.error("❌ Error sending notification:", err);
  }
};

// ✅ Create interview
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.resume = req.file.filename;

    const interview = new Interview(data);
    await interview.save();

    // ✅ Trigger Notification
    await notifyHiringManager(data);

    res.status(201).json(interview);
  } catch (err) {
    console.error("Error saving interview:", err);
    res.status(500).json({ error: "Error saving interview" });
  }
});

// ✅ Get all interviews
router.get("/", async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update interview
router.put("/:id", upload.single("resume"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.resume = req.file.filename;

    const updated = await Interview.findByIdAndUpdate(req.params.id, data, { new: true });
    
    // ✅ Trigger Notification on Update
    await notifyHiringManager(data);

    res.json(updated);
  } catch (err) {
    console.error("Error updating interview:", err);
    res.status(500).json({ error: "Error updating interview" });
  }
});

// ✅ Delete interview
router.delete("/:id", async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting interview" });
  }
});

module.exports = router;