const database = require("../config/db");

const db = database.getDbServiceInstance();

exports.pinChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (chatId && userId) {
      await db.pinChat({ chatId, userId });

      const chats = await db.getAllMessagesByUsername({
        sender: userId,
        receiver: userId,
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
    const { chatId, username } = req.body;

    if (chatId && username) {
      await db.unpinChat({ chatId, userId: username });

      const chats = await db.getAllMessagesByUsername({
        sender: userId,
        receiver: userId,
      });

      res.json(chats);
    } else {
      res.status(500).json({ error: "chatId and username is required" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Implement other controller methods for CRUD operations
