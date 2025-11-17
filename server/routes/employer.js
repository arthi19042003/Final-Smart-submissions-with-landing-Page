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

router.get("/", auth, getEmployerProfile);

router.post("/", auth, createOrUpdateEmployer);

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

router.put("/team/:memberId", auth, updateTeamMember);

router.delete("/team/:memberId", auth, deleteTeamMember);

module.exports = router;
