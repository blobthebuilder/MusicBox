const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const SECRET = process.env.JWT_SECRET;

// **User Signup**
exports.signup = async (req, res) => {
  console.log("Signup request");
  const { email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "User created", token, user });
  } catch (err) {
    console.error("Error creating user:", err);

    // Handle duplicate email error (PostgreSQL error code 23505)
    if (err.code === "23505") {
      return res.status(400).json({ error: "User already exists" });
    }

    res
      .status(500)
      .json({ error: "Error creating user", details: err.message });
  }
};

// **User Login**
exports.login = async (req, res) => {
  console.log("Login request");
  const { email, password } = req.body;

  try {
    // Find user by email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Error logging in", details: err.message });
  }
};
