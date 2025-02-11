const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "*", // Expo Go default URL
  })
);
app.use(express.json());

// Import Routes
app.use("/auth", require("./routes/authRoutes"));
//app.use("/songs", require("./routes/songRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Backend running on port ${PORT}`)
);
