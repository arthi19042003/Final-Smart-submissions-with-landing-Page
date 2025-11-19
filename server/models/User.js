const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Added crypto import

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
    
    companyName: { type: String, default: '' },
    hiringManagerFirstName: { type: String, default: '' }, 
    hiringManagerLastName: { type: String, default: '' },  
    hiringManagerPhone: { type: String, default: '' },   
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

    agencyName: { type: String, default: '' },
    
    majorskillsarea: [{ type: String }], 
    
    resumeskills: { type: String, default: '' }, 

    partnerships: [{ type: String }],
    companyCertifications: [{ type: String }],
    dunsNumber: { type: String, default: '' },
    
    numberofemployees: { type: String, default: '' }, 
    
    ratecards: [{ 
      role: String, 
      lpa: String 
    }],
    
    location: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Added fields for password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Added method to generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);