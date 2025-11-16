// server/routes/onboarding.js
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Candidate = require("../models/Candidate");
const protect = require("../middleware/auth");

// ✅ GET Hired Candidates (Unified View)
router.get("/", protect, async (req, res) => {
  try {
    // ---------------------------------------------------------
    // 1. Fetch Hired Direct Applications
    // ---------------------------------------------------------
    const appsRaw = await Application.find({ status: "Hired" })
      .populate("jobId", "title department") // Populate Position to get Department
      .populate("createdBy", "profile email") // Populate User to get Name fallback
      .lean();

    const apps = appsRaw.map((app) => {
      // Try to get name from App -> User Profile -> User Email
      let name = app.candidateName;
      if (!name && app.createdBy?.profile) {
        name = `${app.createdBy.profile.firstName} ${app.createdBy.profile.lastName}`;
      }
      if (!name || name.trim() === "") {
        name = app.createdBy?.email || "Unknown Candidate";
      }

      return {
        _id: app._id,
        candidateName: name,
        email: app.email || app.createdBy?.email,
        position: app.position, // Use stored position title
        department: app.jobId?.department || "-", // Get department from populated Position
        status: app.status,
        appliedAt: app.appliedAt,
        onboardingStatus: app.onboardingStatus || "Pending",
        type: "Direct"
      };
    });

    // ---------------------------------------------------------
    // 2. Fetch Hired Recruiter Submissions
    // ---------------------------------------------------------
    const submissionsRaw = await Submission.find()
      .populate({
        path: "candidate",
        match: { status: "Hired" }, // Only Hired candidates
      })
      .populate("position", "title department")
      .lean();

    const submissions = submissionsRaw
      .map((sub) => {
        if (!sub.candidate || !sub.position) return null;

        return {
          _id: sub.candidate._id, // Use Candidate ID for updates
          candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
          email: sub.candidate.email,
          position: sub.position.title,
          department: sub.position.department,
          status: sub.candidate.status,
          appliedAt: sub.createdAt,
          onboardingStatus: sub.candidate.onboardingStatus || "Pending",
          type: "Agency"
        };
      })
      .filter((item) => item !== null);

    // ---------------------------------------------------------
    // 3. Merge & Sort
    // ---------------------------------------------------------
    const unifiedList = [...apps, ...submissions].sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json(unifiedList);
  } catch (err) {
    console.error("Error fetching onboarding:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT Update Status (Same as before)
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { onboardingStatus } = req.body;

    // Try Application first
    let updated = await Application.findByIdAndUpdate(
      req.params.id,
      { onboardingStatus },
      { new: true }
    );

    // If not found, try Candidate
    if (!updated) {
      updated = await Candidate.findByIdAndUpdate(
        req.params.id,
        { onboardingStatus },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;