const mongoose = require('mongoose');
const { Schema } = mongoose;

const PositionSchema = new Schema({
  title: { type: String, required: true },
  department: String,
  project: String, 
  organization: String, 
  description: String,
  requiredSkills: [String],
  location: String,
  openings: { type: Number, default: 1 },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Position', PositionSchema);