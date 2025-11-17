const express = require("express");
const router = express.Router();
const multer = require("multer");
const Interview = require("../models/Interview");
const Message = require("../models/Message");
const Position = require("../models/Position");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const notifyHiringManager = async (data) => {
  if (data.notifyManager !== "true" && data.notifyManager !== true) return;

  try {
    console.log("🔔 Notification requested for:", data.jobPosition);
    const position = await Position.findOne({ title: data.jobPosition });
    
    if (!position || !position.createdBy) {
      console.warn(`⚠️ Position "${data.jobPosition}" not found or has no creator. Notification skipped.`);
      return;
    }

    const manager = await User.findById(position.createdBy);
    if (!manager || !manager.email) {
      console.warn("⚠️ Hiring Manager user not found.");
      return;
    }

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

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.resume = req.file.filename;

    const interview = new Interview(data);
    await interview.save();
    await notifyHiringManager(data);

    res.status(201).json(interview);
  } catch (err) {
    console.error("Error saving interview:", err);
    res.status(500).json({ error: "Error saving interview" });
  }
});

router.get("/", async (req, res) => {
  try {
    const user = req.user; 
    let query = {};

    if (user && user.role === "candidate") {
      const profile = user.profile || {};
      const firstName = profile.firstName || "";
      const lastName = profile.lastName || "";

      if (firstName) {
        query.candidateFirstName = { $regex: new RegExp(`^${firstName}$`, "i") };
      }
      
      if (lastName) {
        query.candidateLastName = { $regex: new RegExp(`^${lastName}$`, "i") };
      }
    }

    const interviews = await Interview.find(query).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    console.error("Error fetching interviews:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", upload.single("resume"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.resume = req.file.filename;

    const updated = await Interview.findByIdAndUpdate(req.params.id, data, { new: true });
    
    await notifyHiringManager(data);

    res.json(updated);
  } catch (err) {
    console.error("Error updating interview:", err);
    res.status(500).json({ error: "Error updating interview" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting interview" });
  }
});

module.exports = router;