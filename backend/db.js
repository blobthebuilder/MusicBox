require("dotenv").config();
const { Pool } = require("pg");

// Create a new connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection
pool
  .connect()
  .then(() => console.log("🚀 Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Connection error", err));

module.exports = pool;
