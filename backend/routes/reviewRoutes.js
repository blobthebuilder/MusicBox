const express = require("express");
const {
  addReview,
  getReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateUser, addReview); // Create review
router.get("/:songId", getReviews); // Get all reviews for a song
router.get("/:userId", getUserReviews); // Get reviews for a song
router.put("/:reviewId", authenticateUser, updateReview); // Edit review
router.delete("/:reviewId", authenticateUser, deleteReview); // Delete review

module.exports = router;
