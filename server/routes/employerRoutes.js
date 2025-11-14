const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employer = require("../models/Employer");

// ✅ REGISTER EMPLOYER
router.post("/register", async (req, res) => {
  try {
    const {
      companyName,
      hiringManagerFirstName,
      hiringManagerLastName,
      email,
      hiringManagerPhone,
      password,
    } = req.body;

    // Check required fields
    if (
      !companyName ||
      !hiringManagerFirstName ||
      !hiringManagerLastName ||
      !email ||
      !hiringManagerPhone ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if employer already exists
    const existing = await Employer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Employer already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employer
    const employer = await Employer.create({
      companyName,
      hiringManagerFirstName,
      hiringManagerLastName,
      email,
      hiringManagerPhone,
      password: hashedPassword,
      userType: "employer",
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: employer._id, userType: "employer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send success response
    res.status(201).json({
      message: "Employer registration successful",
      token,
      user: {
        id: employer._id,
        name: employer.companyName,
        email: employer.email,
        userType: employer.userType,
      },
    });
  } catch (err) {
    console.error("❌ Employer Registration Error:", err.message);
    res.status(500).json({ message: "Employer registration failed" });
  }
});

// ✅ LOGIN EMPLOYER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find employer
    const employer = await Employer.findOne({ email });
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: employer._id, userType: "employer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Success response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: employer._id,
        name: employer.companyName,
        email: employer.email,
        userType: employer.userType,
      },
    });
  } catch (err) {
    console.error("❌ Employer Login Error:", err.message);
    res.status(500).json({ message: "Employer login failed" });
  }
});

module.exports = router;
