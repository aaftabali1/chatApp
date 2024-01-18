const express = require("express");
const url = require("url");
const db = require("./db");
const app = express();
const PORT = 4000;

const date = new Date();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

app.get("/api", async (req, res) => {
  try {
    const sql = "SELECT * FROM chats WHERE senderId = ? OR receiverId = ?";
    const messagesSql = "SELECT * FROM messages WHERE chatId = ?";

    const chats = await db.executeQuery(sql, [
      req.query.username,
      req.query.username,
    ]);

    for (let i = 0; i < chats.length; i++) {
      const messages = await db.executeQuery(messagesSql, [chats[i].id]);
      chats[i].messages = messages;
    }

    res.json(chats);
  } catch (e) {
    console.log("Error", e);
    res.json([]);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username } = req.body;

    const userSql = "SELECT * FROM users WHERE username = ?";

    const userFound = await db.executeQuery(userSql, [username]);

    if (userFound.length > 0) {
      res.status(400).json({ message: "User already registered" });
    } else {
      const sql =
        "INSERT INTO users (username, mobile, status, time) VALUES (?, ?, ?, ?)";
      const registerUser = db.executeQuery(sql, [username, "", 1, new Date()]);

      if (registerUser) {
        console.log("User registered successfully");
        res.status(201).json({ message: "User registered successfully" });
      }
    }
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const generateID = () => Math.random().toString(36).substring(2, 10);

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "<http://localhost:3000>",
  },
});

socketIO.use((socket, next) => {
  if (socket.handshake.query) {
    let callerId = socket.handshake.query.callerId;
    socket.user = callerId;
    next();
  }
});

// const { getIO, initIO } = require("./socket");

// initIO(http);

// getIO();

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected! `);

  // socket.join(socket.user);

  socket.on("call", async (data) => {
    console.log("Call method in index");
    const findUserSql = "SELECT * FROM users WHERE username = ?";
    const fetchUser = await db.executeQuery(findUserSql, [data.calleeId]);
    const fetchUserCaller = await db.executeQuery(findUserSql, [data.callerId]);
    let rtcMessage = data.rtcMessage;

    socket.to(fetchUser[0].socket).emit("newCall", {
      callerId: fetchUserCaller[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("answerCall", async (data) => {
    const findUserSql = "SELECT * FROM users WHERE username = ?";
    console.log("AnswerCall in index");
    let callerId = data.callerId;
    rtcMessage = data.rtcMessage;

    const fetchUser = await db.executeQuery(findUserSql, [data.calleeId]);
    const fetchUserCaller = await db.executeQuery(findUserSql, [callerId]);

    socket.to(fetchUserCaller[0].socket).emit("callAnswered", {
      callee: fetchUser[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("ICEcandidate", async (data) => {
    console.log("ICEcandidate data.calleeId", data.calleeId);

    const findUserSql = "SELECT * FROM users WHERE username = ?";
    let calleeId = data.calleeId;

    const fetchUser = await db.executeQuery(findUserSql, [calleeId]);
    const fetchUserCaller = await db.executeQuery(findUserSql, [data.callerId]);
    let rtcMessage = data.rtcMessage;

    socket.to(fetchUser[0].socket).emit("ICEcandidate", {
      sender: fetchUserCaller[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("endCall", async (data) => {
    const findUserSql = "SELECT * FROM users WHERE username = ?";
    console.log("AnswerCall in index");
    let callerId = data.callerId;

    const fetchUser = await db.executeQuery(findUserSql, [data.calleeId]);
    const fetchUserCaller = await db.executeQuery(findUserSql, [callerId]);

    socket.to(fetchUserCaller[0].socket).emit("callEnd", {});
    // socket.to(fetchUser[0].socket).emit("callEnd", {});
  });

  socket.on("updateUser", (username) => {
    const sql = "UPDATE users SET socket = ?, time = ? WHERE username = ?";

    // Use the executeQuery function
    db.executeQuery(sql, [socket.id, date, username], (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        // db.closeConnection();
        // Handle the error appropriately
      } else {
        // db.closeConnection();
        // Process the results as needed
      }

      // Don't forget to close the connection when done
    });
    // users.unshift({ id: generateID(), username, socketId: socket.id, socket });
  });

  socket.on("addUser", async ({ senderId, receiverId }) => {
    const sql = "INSERT INTO chats (senderId, receiverId, time) VALUES (?,?,?)";
    const findUserSql = "SELECT * FROM users WHERE username = ?";

    await db.executeQuery(sql, [senderId, receiverId, date]);

    socket.join(receiverId);
    //👇🏻 Adds the new group name to the chat rooms array
    // messages.unshift({ id: generateID(), senderId, receiverId, messages: [] });
    //👇🏻 Returns the updated chat rooms via another event
    socket.emit("messageList", {
      id: generateID(),
      senderId,
      receiverId,
      messages: [],
    });

    const fetchUser = await db.executeQuery(findUserSql, [receiverId]);

    if (fetchUser.length > 0) {
      socket.to(fetchUser[0].socket).emit("messageList", {
        id: generateID(),
        senderId,
        receiverId,
        messages: [],
      });
    }
    // receiverUser.socket.emit("messageList", []);
  });

  socket.on("getMessages", (username) => {
    const sql = "SELECT * FROM chats WHERE senderId = ? OR receiverId = ?";

    // Use the executeQuery function
    db.executeQuery(sql, [username, username], (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        // db.closeConnection();
        // Handle the error appropriately
      } else {
        socket.emit("messageList", results);
        // db.closeConnection();
        // Process the results as needed
      }

      // Don't forget to close the connection when done
    });

    // let result = messages.some(
    //   (message) =>
    //     message.receiverId == username || message.senderId == username
    // );
    //👇🏻 Sends the messages to the app
    // socket.emit("messageList", result);
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });

  socket.on("findUser", async ({ id, receiver, sender }) => {
    const receiverQuery = "SELECT * FROM users WHERE username = ?";

    const messagesQuery = "SELECT * FROM messages WHERE chatId = ?";

    const receiverData = await db.executeQuery(receiverQuery, [receiver]);
    const senderData = await db.executeQuery(receiverQuery, [sender]);

    const allMessages = await db.executeQuery(messagesQuery, [id]);

    socket.emit("foundUser", allMessages);
    socket.emit("messageList", {
      id: id,
      senderId: sender,
      receiverId: receiver,
      messages: allMessages,
    });

    if (receiverData.length > 0) {
      socket.to(receiverData[0].socket).emit("foundUser", allMessages);
      socket.to(receiverData[0].socket).emit("messageList", {
        id: id,
        senderId: sender,
        receiverId: receiver,
        messages: allMessages,
      });
      console.log(receiverData[0].socket);
    }
    if (senderData.length > 0) {
      socket.to(senderData[0].socket).emit("foundUser", allMessages);
      socket.to(senderData[0].socket).emit("messageList", {
        id: id,
        senderId: sender,
        receiverId: receiver,
        messages: allMessages,
      });
      console.log(senderData[0].socket);
    }
  });

  socket.on("newChatMessage", async (data) => {
    try {
      //👇🏻 Destructures the property from the object
      const { chat_id, message, sender, receiver } = data;

      const insertQuery =
        "INSERT INTO messages (`message`, `read`, `chatId`, `senderId`, `receiverId`, `time`) VALUES (?,?,?,?,?,?)";

      const receiverQuery = "SELECT * FROM users WHERE username = ?";

      const messagesQuery = "SELECT * FROM messages WHERE chatId = ?";

      await db.executeQuery(insertQuery, [
        message,
        0,
        chat_id,
        sender,
        receiver,
        date,
      ]);

      const receiverData = await db.executeQuery(receiverQuery, [receiver]);
      const senderData = await db.executeQuery(receiverQuery, [sender]);

      const allMessages = await db.executeQuery(messagesQuery, [chat_id]);

      socket.emit("foundUser", allMessages);

      if (receiverData.length > 0) {
        socket.to(receiverData[0].socket).emit("foundUser", allMessages);
        socket.to(receiverData[0].socket).emit("messageList", {
          id: chat_id,
          senderId: sender,
          receiverId: receiver,
          messages: allMessages,
        });
        console.log("RECEIVER", receiverData[0].socket);
      }
      if (senderData.length > 0) {
        socket.to(senderData[0].socket).emit("foundUser", allMessages);
        socket.to(senderData[0].socket).emit("messageList", {
          id: chat_id,
          senderId: sender,
          receiverId: receiver,
          messages: allMessages,
        });
        console.log("SENDER", senderData[0].socket);
      }
      // receiverUser.socket.emit("messageList", allMessages);
      // receiverUser.socket.emit("foundUser", result?.messages);

      // const senderUser = users.find((user) => user.username == result.senderId);
      // senderUser.socket.emit("messageList", messages);
      // senderUser.socket.emit("foundUser", result?.messages);
    } catch (e) {
      console.log("Error in sending message", e);
    }
  });
});
