const pool = require("../db");

// **Create Review**
exports.addReview = async (req, res) => {
  try {
    const { songId, rating, comment } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      "INSERT INTO reviews (user_id, song_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, songId, rating, comment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log("Error adding review:", err);
    res.status(500).json({ error: "Error adding review" });
  }
};

// get all reviews
exports.getReviews = async (req, res) => {
  try {
    const { songId } = req.params;
    const result = await pool.query(
      "SELECT * FROM reviews WHERE song_id = $1",
      [songId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
};

// get all reviews made by a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM reviews WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
};

// Edit Review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params; // Get reviewId from the URL params
    const { rating, comment } = req.body; // Get updated data from the request body
    const userId = req.user.userId; // Get the user id from the authenticated token
    // Check if the review exists and belongs to the current user
    const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [
      reviewId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = result.rows[0];
    if (review.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own reviews" });
    }

    // Update the review
    const updatedReview = await pool.query(
      "UPDATE reviews SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [rating, comment, reviewId]
    );

    res.json(updatedReview.rows[0]); // Return the updated review
  } catch (err) {
    console.log("Error updating review:", err);
    res.status(500).json({ error: "Error updating review" });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params; // Get reviewId from the URL params
    const userId = req.user.userId; // Get the user id from the authenticated token

    // Check if the review exists and belongs to the current user
    const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [
      reviewId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = result.rows[0];
    if (review.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    // Delete the review
    await pool.query("DELETE FROM reviews WHERE id = $1", [reviewId]);

    res.json({ message: "Review deleted successfully" }); // Send confirmation message
  } catch (err) {
    console.log("Error deleting review:", err);
    res.status(500).json({ error: "Error deleting review" });
  }
};
