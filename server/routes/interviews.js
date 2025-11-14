const express = require("express");
const router = express.Router();
const multer = require("multer");
const Interview = require("../models/Interview");
const Message = require("../models/Message"); // ✅ Import Message model
const Position = require("../models/Position"); // ✅ Import Position model
const User = require("../models/User"); // ✅ Import User model

// ✅ File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Helper Function to Notify Manager ---
const notifyHiringManager = async (data) => {
  // Check if notification is requested
  if (data.notifyManager !== "true" && data.notifyManager !== true) return;

  try {
    console.log("🔔 Attempting to notify hiring manager...");

    // 1. Find the Position by title to see who created it (The Hiring Manager)
    const position = await Position.findOne({ title: data.jobPosition });
    
    if (!position || !position.createdBy) {
      console.warn(`⚠️ Position "${data.jobPosition}" not found or has no creator. Cannot notify.`);
      return;
    }

    // 2. Find the Manager's User details (to get email)
    const manager = await User.findById(position.createdBy);
    if (!manager || !manager.email) {
      console.warn("⚠️ Hiring Manager user not found.");
      return;
    }

    // 3. Create the Message in the Database
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

    await Message.create({
      to: manager.email,       // Send to Manager's email
      from: "System",          // Sender name
      subject: subject,
      message: messageBody,
      status: "unread",
      relatedId: data._id      // Optional: Link to interview ID if needed
    });

    console.log(`✅ Notification sent to ${manager.email}`);

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

    const updated = await Interview.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    // ✅ Trigger Notification on Update too
    await notifyHiringManager(data);

    res.json(updated);
  } catch (err) {
    console.error(err);
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