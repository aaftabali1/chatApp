const mysql = require("mysql2");
const {
  chatsTable,
  messagesTable,
  usersTable,
  callsTable,
  pinnedChats,
} = require("./constants");

let instance = null;

// create a new MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "chat",
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

  async getUserChats({ sender, receiver }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${chatsTable} WHERE senderId = ? OR receiverId = ?`;
        connection.query(query, [sender, receiver], (err, results) => {
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
        const query = `SELECT * FROM ${messagesTable} WHERE chatId = ? ORDER BY id DESC LIMIT 20 OFFSET ?`;
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

  async registerUser({ username, mobile, status }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${usersTable} (username, mobile, status, time) VALUES (?, ?, ?, ?)`;

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

  async createChat({ sender, receiver }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${chatsTable} (senderId, receiverId, time) VALUES (?,?,?)`;

        connection.query(query, [sender, receiver, time], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
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
          " (`message`, `seen`, `chatId`, `senderId`, `receiverId`, `time`) VALUES (?,?,?,?,?,?)";

        connection.query(
          query,
          [message, read, chatId, senderId, receiverId, time],
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
        const query = `INSERT INTO ${callsTable} (callerId, receiverId, time, type) VALUES (?,?,?,?)`;

        connection.query(
          query,
          [callerId, receiverId, time, type],
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

  async getUnreadMessages({ chatId, senderId, receiverId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${messagesTable} WHERE chatId = ? AND seen=0 AND receiverId = ?`;
        connection.query(query, [chatId, receiverId], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllMessagesByUsername({ sender, receiver }) {
    try {
      const chats = await this.getUserChats({ sender, receiver });

      for (let i = 0; i < chats.length; i++) {
        const unreadMessages = await this.getUnreadMessages({
          chatId: chats[i].id,
          senderId: sender,
          receiverId: receiver,
        });
        const messages = await this.getUserMessages({
          chatId: chats[i].id,
          offset: 0,
        });
        chats[i].messages = messages;
        chats[i].unreadCount = unreadMessages.length;
      }

      return chats;
    } catch (error) {
      console.log(error);
    }
  }

  async markChatRead({ chatId, senderId, receiverId }) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `UPDATE ${messagesTable} SET seen = 1 WHERE chatId = ? AND senderId = ? AND receiverId = ?`;
        connection.query(
          query,
          [chatId, senderId, receiverId],
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

  async pinChat({ chatId, userId }) {
    try {
      const time = new Date();
      const response = await new Promise((resolve, reject) => {
        const query = `INSERT INTO ${pinnedChats} (chatId, userId, time) VALUES (?,?,?)`;
        connection.query(query, [chatId, userId, time], (err, results) => {
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
