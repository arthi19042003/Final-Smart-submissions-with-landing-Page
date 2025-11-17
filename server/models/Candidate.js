const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  position: String, 
  agency: String,
  recruiter: String,
  status: {
    type: String,
    enum: [
      "Submitted",
      "Under Review",
      "Phone Screen Scheduled",
      "Shortlisted",
      "Interview", 
      "Rejected",
      "Onsite Scheduled",
      "Hired",
    ],
    default: "Submitted",
  },
  createdAt: { type: Date, default: Date.now },

  rate: { type: String, default: '' },
  currentLocation: { type: String, default: '' },
  availability: { type: String, default: '' }, 
  skypeId: { type: String, default: '' },
  githubProfile: { type: String, default: '' },
  linkedinProfile: { type: String, default: '' },
  
  company: { type: String, default: '' },
  hiringManager: { type: String, default: '' },

  submittedByRecruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  resumePath: { type: String, default: '' },
  resumeOriginalName: { type: String, default: '' },

  interviewDate: { type: Date },

  onboardingStatus: { 
    type: String, 
    enum: ["Pending", "In Progress", "Completed"], 
    default: "Pending" 
  }
});

module.exports = mongoose.model("Candidate", CandidateSchema);