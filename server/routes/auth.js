const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .notEmpty()
      .isIn(["candidate", "employer", "hiringManager", "recruiter"]) 
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role, ...profileData } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        email,
        password: password,
        role,
        profile: profileData,
      });

      await user.save(); 

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Registration Error:", error.message);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
    body("role")
      .optional()
      .isIn(["candidate", "employer", "hiringManager", "recruiter"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      if (role && user.role !== role) {
        return res
          .status(400)
          .json({ message: `Invalid credentials for role ${role}` });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile, 
        },
      });
    } catch (error) {
      console.error("Login Error:", error.message);
      res.status(5.00).json({ message: "Server error during login" });
    }
  }
);

module.exports = router;