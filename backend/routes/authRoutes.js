const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// Signup Route
router.post("/signup", async (req, res) => {
  console.log("signup request");
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      message: "User created",
      token,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating user:", err); // Log the error for debugging

    // Send the error message back to the client
    if (err.code === "23505") {
      // Postgres unique constraint violation code (duplicate email or username)
      res.status(400).json({ error: "User already exists" });
    } else {
      res.status(500).json({
        error: "An error occurred while creating the user",
        details: err.message,
      });
    }
  }
});

// Login Route
router.post("/login", async (req, res) => {
  console.log("login request");
  const { email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (user.rows.length === 0)
    return res.status(400).json({ error: "Invalid email or password" });

  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password" });

  const token = jwt.sign({ userId: user.rows[0].id }, SECRET, {
    expiresIn: "7d",
  });
  res.json({
    token,
    user: {
      id: user.rows[0].id,
      email: user.rows[0].email,
    },
  });
});

module.exports = router;
