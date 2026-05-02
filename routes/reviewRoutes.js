const express = require("express");
const { createReview, getUserReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/user/:userId", getUserReviews); // Public or protect depending, let's keep public enough for viewing

module.exports = router;
