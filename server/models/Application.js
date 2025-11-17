const mongoose = require("mongoose");
const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Position" },
  position: String,
  candidateName: String,
  email: String,
  phone: String,
  resumeUrl: String,
  status: {
    type: String,
    enum: ["Applied", "Screening", "Under Review", "Interview", "Offer", "Hired", "Rejected"],
    default: "Applied",
  },
  interviews: [{
    date: Date,
    time: String,
    type: { type: String }, 
    notes: String,
    status: { type: String, default: "Scheduled" }
  }],
  communication: [{
    from: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  onboardingStatus: { 
    type: String, 
    enum: ["Pending", "In Progress", "Completed"], 
    default: "Pending" 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", ApplicationSchema);