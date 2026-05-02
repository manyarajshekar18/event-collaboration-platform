const express = require("express");
const { body } = require("express-validator");
const { signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// POST /api/auth/signup
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["Organizer", "Provider"])
      .withMessage("Role must be Organizer or Provider"),
  ],
  validate,
  signup
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get("/me", protect, getMe);

module.exports = router;
