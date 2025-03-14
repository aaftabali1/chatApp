const mysql = require("mysql2");
const {
  chatsTable,
  messagesTable,
  usersTable,
  callsTable,
  pinnedChats,
  participantsTable,
  chatMappingTable,
  attachmentsTable,
} = require("./constants");
const constants = require("./constants");

let instance = null;

// create a new MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "message_app",
});
// connect to the MySQL database
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
  } else {
    console.log("Connected to MySQL database!");
  }
});

async function executeQuery(sql, values) {
  try {
    const [results, fields] = await connection.promise().query(sql, values);
    return results;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

function closeConnection() {
  connection.end((err) => {
    if (err) {
      console.error("Error closing the MySQL connection:", err);
    }
    console.log("MySQL connection closed");
  });
}

class db {
  static getDbServiceInstance() {
    return instance ? instance : new db();
  }

  async getUserChats({ senderId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `
          SELECT p.chat_id, c.name, u.username as receiver_name, cm.is_pinned as pinned, cm.chat_mapping_id as pinned_id, cm.is_archived as archived, cm.chat_mapping_id as archive_id
          FROM ${participantsTable} p
          LEFT JOIN ${chatsTable} c ON c.chat_id = p.chat_id
          LEFT JOIN ${usersTable} u ON u.user_id = p.user_id
          LEFT JOIN ${chatMappingTable} cm ON cm.chat_id = p.chat_id AND cm.user_id = p.user_id AND (cm.is_pinned = 1 OR cm.is_archived = 1)
          WHERE p.user_id = ?;
        `;
        connection.query(query, [senderId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserChatsById({ chatId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${chatsTable} WHERE id=?`;
        connection.query(query, [chatId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserMessages({ chatId, offset }) {
    try {
      const page = offset * 20;
      const response = await new Promise((resolve, reject) => {
        // const query = `SELECT * FROM ${messagesTable} WHERE chatId = ? ORDER BY id DESC LIMIT 20 OFFSET ?`;
        const query = `
          SELECT m.message_id, m.chat_id, m.sender_id, m.content, m.date, atc.attachment_url, atc.attachment_type, atc.attachment_id
          FROM ${messagesTable} m 
          LEFT JOIN ${attachmentsTable} atc ON m.message_id = atc.message_id AND m.content = ""
          WHERE m.chat_id = ? 
          ORDER BY m.message_id DESC LIMIT 20 OFFSET ?;`;
        connection.query(query, [chatId, page], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getUser({ username }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${usersTable} WHERE username = ?`;
        connection.query(query, [username], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserById({ userId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${usersTable} WHERE user_id = ?`;
        connection.query(query, [userId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async registerUser({ username, mobile, status }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${usersTable} (username, mobile, active, time) VALUES (?, ?, ?, ?)`;

        connection.query(
          query,
          [username, mobile, status, time],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async updateUser({ socket, username }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE ${usersTable} SET socket = ?, time = ? WHERE username = ?`;

        connection.query(query, [socket, time, username], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async createChat({ senderId, receiverId }) {
    try {
      const time = new Date();
      const createChatResponse = await new Promise((resolve, reject) => {
        const queryToCreateChat = `INSERT INTO ${chatsTable} (type, name, created_time) VALUES (?,?,?)`;
        connection.query(queryToCreateChat, [0, "", time], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });

      const response = await new Promise((resolve, reject) => {
        const queryToAddParticipants = `INSERT INTO ${participantsTable} (chat_id, user_id, time) VALUES (?,?,?), (?,?,?)`;
        connection.query(
          queryToAddParticipants,
          [
            createChatResponse.insertId,
            senderId,
            time,
            createChatResponse.insertId,
            receiverId,
            time,
          ],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async insertMessage({ message, read, chatId, senderId, receiverId }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query =
          "INSERT INTO " +
          messagesTable +
          " (chat_id, sender_id, content, date, is_read) VALUES (?,?,?,?,?)";

        connection.query(
          query,
          [chatId, senderId, message, time, read],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async insertCall({ callerId, receiverId, type }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${callsTable} (caller_id, receiver_id, call_type, start_time, end_time, status) VALUES (?,?,?,?,?,?)`;

        connection.query(
          query,
          [callerId, receiverId, type, time, time, "Calling"],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async updateCall({ callId, status }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE ${callsTable} SET status = ? WHERE id = ?`;

        connection.query(query, [status, callId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getCalls({ callerId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${callsTable} WHERE callerId = ? OR receiverId = ?`;
        connection.query(query, [callerId, callerId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getUnreadMessages({ chatId, userId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT m.message_id, m.chat_id, m.sender_id, m.content, m.date
        FROM ${messagesTable} m
        JOIN ${participantsTable} uc ON m.chat_id = uc.chat_id
        WHERE uc.user_id = ? AND m.is_read = 0 AND m.sender_id != uc.user_id AND m.chat_id = ?;`;
        connection.query(query, [userId, chatId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getOtherUsersOfChat({ chatId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT *
        FROM ${participantsTable} p 
        LEFT JOIN ${usersTable} u ON u.user_id = p.user_id
        WHERE p.chat_id = ?`;
        connection.query(query, [chatId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllMessagesByUsername({ userId, filter }) {
    try {
      const chats = await this.getUserChats({ senderId: userId, filter });

      for (let i = 0; i < chats.length; i++) {
        const otherUsers = await this.getOtherUsersOfChat({
          chatId: chats[i].chat_id,
        });

        const unreadMessages = await this.getUnreadMessages({
          chatId: chats[i].chat_id,
          userId: userId,
        });
        const messages = await this.getUserMessages({
          chatId: chats[i].chat_id,
          offset: 0,
        });
        chats[i].messages = messages;
        chats[i].unreadCount = unreadMessages.length;
        chats[i].receiver_name = otherUsers.find(
          (item) => item.user_id != userId
        ).username;
        chats[i].receiver_id = otherUsers.find(
          (item) => item.user_id != userId
        ).user_id;
      }

      return chats;
    } catch (error) {
      console.log(error);
    }
  }

  async markChatRead({ chatId, userId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE ${messagesTable} SET is_read = 1 WHERE chat_id = ? AND sender_id = ?`;
        connection.query(query, [chatId, userId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async pinChat({ chatId, userId }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${chatMappingTable} (chat_id, user_id, is_archived, is_pinned, date) VALUES (?,?,?,?,?)`;
        connection.query(
          query,
          [chatId, userId, 0, 1, time],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async unpinChat({ pinChatId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `DELETE FROM ${chatMappingTable} WHERE chat_mapping_id = ?`;
        connection.query(query, [pinChatId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async addAudio({ messageId, audioUrl }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${attachmentsTable} (message_id, attachment_type, attachment_url) VALUES (?,?,?)`;
        connection.query(query, [messageId, 2, audioUrl], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async addImage({ messageId, imageUrl }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${attachmentsTable} (message_id, attachment_type, attachment_url) VALUES (?,?,?)`;
        connection.query(query, [messageId, 0, imageUrl], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async addVideo({ messageId, videoUrl }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${attachmentsTable} (message_id, attachment_type, attachment_url) VALUES (?,?,?)`;
        connection.query(query, [messageId, 1, videoUrl], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async archiveChat({ chatId, userId }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${chatMappingTable} (chat_id, user_id, is_archived, is_pinned, date) VALUES (?,?,?,?,?)`;
        connection.query(
          query,
          [chatId, userId, 1, 0, time],
          (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async unarchiveChat({ archiveChatId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `DELETE FROM ${chatMappingTable} WHERE chat_mapping_id = ?`;
        connection.query(query, [archiveChatId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteChat({ chatId, userId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE ${participantsTable} SET deleted = 1 WHERE chat_id = ? AND user_id = ?`;
        connection.query(query, [chatId, userId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async clearChat({ chatId, userId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE ${participantsTable} SET cleared = 1 WHERE chat_id = ? AND user_id = ?`;
        connection.query(query, [chatId, userId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = db;

// module.exports = { connection, closeConnection, executeQuery };
