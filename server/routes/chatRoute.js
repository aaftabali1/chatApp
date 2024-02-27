const express = require("express");
const router = express.Router();
const chatsController = require("../controllers/chatsController");

router.post("/", chatsController.chats);
router.post("/pin-chat", chatsController.pinChat);
router.post("/unpin-chat", chatsController.unpinChat);
router.post("/archive-chat", chatsController.archiveChat);
router.post("/unarchive-chat", chatsController.unarchiveChat);
router.post("/delete-chat", chatsController.deleteChat);
router.post("/clear-chat", chatsController.clearChat);
// Define other routes as needed

module.exports = router;
