const pool = require("../db");

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    const senderId = req.user.userId;

    // Prevent a user from sending a request to themselves
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ error: "You cannot send a friend request to yourself." });
    }

    // Check if a request already exists between the two users
    const existingRequest = await pool.query(
      "SELECT * FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
      [senderId, receiverId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        error: "A request has already been sent between these users.",
      });
    }

    // Insert the new friend request into the table
    await pool.query(
      "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')",
      [senderId, receiverId]
    );

    res.status(200).json({ message: "Friend request sent." });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ error: "Failed to send friend request." });
  }
};

// Accept Friend Request
exports.acceptRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;

    // Check if a pending request exists
    const request = await pool.query(
      "SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'",
      [senderId, receiverId]
    );

    if (request.rows.length === 0) {
      return res.status(400).json({ error: "No pending request found." });
    }

    // Update the request status to 'accepted'
    await pool.query(
      "UPDATE friend_requests SET status = 'accepted' WHERE sender_id = $1 AND receiver_id = $2",
      [senderId, receiverId]
    );

    // Add the friendship to the 'friends' table
    await pool.query(
      "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1)",
      [senderId, receiverId]
    );

    res.status(200).json({ message: "Friend request accepted." });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({ error: "Failed to accept friend request." });
  }
};
