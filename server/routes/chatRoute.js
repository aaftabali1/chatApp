const express = require("express");
const router = express.Router();
const chatsController = require("../controllers/chatsController");

router.post("/", chatsController.chats);
router.post("/pin-chat", chatsController.pinChat);
router.post("/unpin-chat", chatsController.unpinChat);
router.post("/archive-chat", chatsController.archiveChat);
// Define other routes as needed

module.exports = router;
