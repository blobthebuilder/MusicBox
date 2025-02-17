const express = require("express");
const {
  sendRequest,
  acceptRequest,
} = require("../controllers/friendRequestController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send/:id", authenticateUser, sendRequest);
router.post("/accept/:id", authenticateUser, acceptRequest);

module.exports = router;
