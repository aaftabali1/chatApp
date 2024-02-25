const database = require("../config/db");

const db = database.getDbServiceInstance();

exports.chats = async (req, res) => {
  try {
    const { username } = req.body;

    if (username) {
      const chats = await db.getAllMessagesByUsername({
        userId: username,
      });

      res.json(chats);
    } else {
      res.status(500).json({ error: "username is required" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.pinChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (chatId && userId) {
      await db.pinChat({
        chatId,
        userId,
      });

      const chats = await db.getAllMessagesByUsername({
        userId,
      });

      res.json(chats);
    } else {
      res.status(500).json({ error: "chatId and userId is required" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.unpinChat = async (req, res) => {
  try {
    const { pinChatId, userId } = req.body;

    if (pinChatId && pinChatId) {
      await db.unpinChat({
        pinChatId,
      });

      const chats = await db.getAllMessagesByUsername({
        userId,
      });

      res.json(chats);
    } else {
      res.status(500).json({ error: "chatId and userId is required" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId, username } = req.body;

    if (pinChatId && username) {
      await db.unpinChat({
        pinChatId,
      });

      const chats = await db.getAllMessagesByUsername({
        sender: username,
        receiver: username,
      });

      res.json(chats);
    } else {
      res.status(500).json({ error: "chatId and userId is required" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.archiveChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (chatId && userId) {
      await db.archiveChat({
        chatId,
        userId,
      });

      const chats = await db.getAllMessagesByUsername({
        userId,
      });

      res.json(chats);
    } else {
      res.status(500).json({ error: "chatId and userId is required" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
