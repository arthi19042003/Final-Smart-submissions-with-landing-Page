const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
    startDate: Date,
    documentsCompleted: Boolean,
    status: { type: String, default: "Initiated" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Onboarding", onboardingSchema);
