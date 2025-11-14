const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const {
  getEmployerProfile,
  createOrUpdateEmployer,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/employerController");

// ✅ Get current employer profile
router.get("/", auth, getEmployerProfile);

// ✅ Create or update employer profile
router.post("/", auth, createOrUpdateEmployer);

// ✅ Add team member
router.post(
  "/team",
  auth,
  [
    body("name").notEmpty().withMessage("Name required"),
    body("role").notEmpty().withMessage("Role required"),
    body("email").isEmail().withMessage("Valid email required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  addTeamMember
);

// ✅ Update team member
router.put("/team/:memberId", auth, updateTeamMember);

// ✅ Delete team member
router.delete("/team/:memberId", auth, deleteTeamMember);

module.exports = router;
