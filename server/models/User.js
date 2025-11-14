// [File: arthi19042003/with-landing-page/With-landing-page-0f24402f43f461a8bca04af752e98da1034a70d5/server/models/User.js]
// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['candidate', 'employer', 'hiringManager', 'recruiter'],
    default: 'candidate'
  },
  profile: {
    // --- Candidate Fields ---
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String,
      current: Boolean
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    }],
    
    // --- Employer / Hiring Manager Fields ---
    companyName: { type: String, default: '' },
    hiringManagerFirstName: { type: String, default: '' }, // For Employer
    hiringManagerLastName: { type: String, default: '' },  // For Employer
    hiringManagerPhone: { type: String, default: '' },   // For Employer
    companyWebsite: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    companyLocation: { type: String, default: '' },
    organization: { type: String, default: '' },
    costCenter: { type: String, default: '' },
    department: { type: String, default: '' },
    preferredCommunicationMode: { type: String, default: "Email" },
    projectSponsors: [{ type: String }],
    projects: [{
      projectName: String,
      teamSize: Number,
      teamMembers: [{
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        role: String
      }]
    }],

    // --- Recruiter Fields (FIXED) ---
    agencyName: { type: String, default: '' },
    
    // ✅ FIX: Changed from 'majorSkills' to 'majorskillsarea'
    majorskillsarea: [{ type: String }], 
    
    // ✅ ADDED: This field was missing from the schema
    resumeskills: { type: String, default: '' }, 

    partnerships: [{ type: String }],
    companyCertifications: [{ type: String }],
    dunsNumber: { type: String, default: '' },
    
    // ✅ FIX: Changed from 'employeeCount' to 'numberofemployees'
    numberofemployees: { type: String, default: '' }, 
    
    // ✅ FIX: Changed 'rateCard' (String) to 'ratecards' (Array of Objects)
    ratecards: [{ 
      role: String, 
      lpa: String 
    }],
    
    // ✅ ADDED: This field was missing from the schema but used in the form
    location: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);