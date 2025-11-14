const Employer = require("../models/Employer");

exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({ user: req.userId });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    res.json(employer);
  } catch (error) {
    console.error("getEmployerProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEmployerProfile = async (req, res) => {
  try {
    const data = req.body;

    let employer = await Employer.findOne({ user: req.userId });

    if (!employer) {
      employer = new Employer({ user: req.userId, ...data });
    } else {
      Object.assign(employer, data);
    }

    await employer.save();
    res.json({ message: "Profile updated successfully", employer });
  } catch (error) {
    console.error("updateEmployerProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
