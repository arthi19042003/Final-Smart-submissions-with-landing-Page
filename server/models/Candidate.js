// [File: arthi19042003/with-landing-page/With-landing-page-0f24402f43f461a8bca04af752e98da1034a70d5/server/models/Candidate.js]
// server/models/Candidate.js
const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  position: String, // Original position applied for
  agency: String,
  recruiter: String,
  status: {
    type: String,
    enum: [
      "Submitted",
      "Under Review",
      "Phone Screen Scheduled",
      "Shortlisted",
      "Rejected",
      "Onsite Scheduled",
      "Hired",
    ],
    default: "Submitted",
  },
  createdAt: { type: Date, default: Date.now },

  // --- New Recruiter Fields ---
  rate: { type: String, default: '' },
  currentLocation: { type: String, default: '' },
  availability: { type: String, default: '' }, // e.g., "Immediate", "2 Weeks"
  skypeId: { type: String, default: '' },
  githubProfile: { type: String, default: '' },
  linkedinProfile: { type: String, default: '' },
  
  // ✅ FIX: Add company and hiringManager fields
  company: { type: String, default: '' },
  hiringManager: { type: String, default: '' },

  // Link to the user who submitted this candidate (if submitted by a recruiter)
  submittedByRecruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // --- ✅ NEW: Fields for Feature 1: View Resume ---
  resumePath: { type: String, default: '' },
  resumeOriginalName: { type: String, default: '' }

});

module.exports = mongoose.model("Candidate", CandidateSchema);