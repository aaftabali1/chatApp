const express = require("express");
const router = express.Router();
const chatsController = require("../controllers/chatsController");

router.post("/pin-chat", chatsController.pinChat);
// Define other routes as needed

module.exports = router;
