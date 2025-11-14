const Resume = require('../models/Resume');
const Position = require('../models/Position');
const mongoose = require('mongoose');

// GET /api/hiring-manager/overview
const getOverview = async (req, res) => {
  try {
    // if auth used: const managerId = req.user._id;
    // For now list global counts; you can filter by req.user.company or hiringManager
    const openPositions = await Position.countDocuments({ status: 'Open' });
    const resumesReceived = await Resume.countDocuments();
    const interviewsScheduled = await Resume.countDocuments({ status: { $in: ['Phone Screen Scheduled','Onsite Scheduled'] } });
    const hires = await Resume.countDocuments({ status: 'Hired' });

    res.json({ openPositions, resumesReceived, interviewsScheduled, hires });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/hiring-manager/resumes
const getResumes = async (req, res) => {
  try {
    // Allow query params: ?status=Under%20Review or ?agency=TechRecruit
    const { status, agency, position } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (agency) filter.agency = agency;
    if (position && mongoose.Types.ObjectId.isValid(position)) filter.position = position;

    const resumes = await Resume.find(filter).sort({ appliedAt: -1 }).limit(200).lean();
    // Map position title
    res.json(resumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/hiring-manager/resumes/:id
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/hiring-manager/resumes/:id/action  { action: 'shortlist'|'reject'|'schedule', note }
const resumeAction = async (req, res) => {
  try {
    const { action, note, scheduleAt } = req.body;
    const id = req.params.id;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    if (action === 'shortlist') resume.status = 'Shortlisted';
    else if (action === 'reject') resume.status = 'Rejected';
    else if (action === 'schedule') {
      resume.status = scheduleAt ? 'Onsite Scheduled' : 'Phone Screen Scheduled';
      resume.metadata = resume.metadata || {};
      resume.metadata.scheduleAt = scheduleAt || new Date();
    } else if (action === 'hire') {
      resume.status = 'Hired';
    }

    if (note) {
      resume.notes.push({ by: (req.user && req.user.email) || 'manager', text: note, date: new Date() });
    }

    await resume.save();
    res.json({ ok: true, resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getOverview,
  getResumes,
  getResumeById,
  resumeAction
};
