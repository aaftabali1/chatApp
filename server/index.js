const express = require("express");
const url = require("url");
const database = require("./db");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

app.get("/api/chats", async (req, res) => {
  try {
    const db = database.getDbServiceInstance();

    const chats = await db.getUserChats({
      sender: req.query.username,
      receiver: req.query.username,
    });

    for (let i = 0; i < chats.length; i++) {
      const messages = await db.getUserMessages({
        chatId: chats[i].id,
        offset: req.query.offset,
      });
      chats[i].messages = messages;
    }

    res.json(chats);
  } catch (e) {
    console.log("Error", e);
    res.json([]);
  }
});

app.get("/api/calls", async (req, res) => {
  try {
    const db = database.getDbServiceInstance();
    const calls = await db.getCalls({
      callerId: req.query.username,
    });
    res.json(calls);
  } catch (e) {
    console.log("Error", e);
    res.json([]);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username } = req.body;

    const db = database.getDbServiceInstance();

    const userFound = await db.getUser({ username });

    if (userFound.length > 0) {
      res.status(400).json({ message: "User already registered" });
    } else {
      const registerUser = await db.registerUser({
        username,
        mobile,
        status: "1",
      });

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
    const db = database.getDbServiceInstance();

    const { calleeId, callerId } = data;

    //TODO:Need to handle if call is already exists
    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    const callInsert = await db.insertCall({
      callerId: callerId,
      receiverId: calleeId,
      type: "video",
    });

    let rtcMessage = data.rtcMessage;

    socket.to(fetchUser[0].socket).emit("newCall", {
      callId: callInsert.insertId,
      callerId: fetchUserCaller[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("audioCall", async (data) => {
    const db = database.getDbServiceInstance();

    const { calleeId, callerId } = data;

    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    const callInsert = await db.insertCall({
      callerId: callerId,
      receiverId: calleeId,
      type: "audio",
    });

    let rtcMessage = data.rtcMessage;

    socket.to(fetchUser[0].socket).emit("newAudioCall", {
      callId: callInsert.insertId,
      callerId: fetchUserCaller[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("answerCall", async (data) => {
    const { callerId, calleeId, rtcMessage, callId } = data;

    const db = database.getDbServiceInstance();

    await db.updateCall({ callId, status: "1" });

    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    socket.to(fetchUserCaller[0].socket).emit("callAnswered", {
      callee: fetchUser[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("answerAudioCall", async (data) => {
    const { callerId, calleeId, rtcMessage, callId } = data;

    const db = database.getDbServiceInstance();

    await db.updateCall({ callId, status: "1" });

    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    socket.to(fetchUserCaller[0].socket).emit("audioCallAnswered", {
      callee: fetchUser[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("ICEcandidate", async (data) => {
    console.log("ICEcandidate data.calleeId", data.calleeId);

    const db = database.getDbServiceInstance();

    const { calleeId, callerId, rtcMessage } = data;

    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    socket.to(fetchUser[0].socket).emit("ICEcandidate", {
      sender: fetchUserCaller[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("endCall", async (data) => {
    const { callerId, calleeId } = data;

    const db = database.getDbServiceInstance();

    // const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    socket.to(fetchUserCaller[0].socket).emit("callEnd", {});
    // socket.to(fetchUser[0].socket).emit("callEnd", {});
  });

  socket.on("updateUser", async (username) => {
    const db = database.getDbServiceInstance();
    await db.updateUser({ socket: socket.id, username });
    // users.unshift({ id: generateID(), username, socketId: socket.id, socket });
  });

  socket.on("addUser", async ({ senderId, receiverId }) => {
    const db = database.getDbServiceInstance();
    await db.createChat({ sender: senderId, receiver: receiverId });

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

    const fetchUser = await db.getUser({ username: receiverId });

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

  socket.on("getMessages", async (username) => {
    const db = database.getDbServiceInstance();

    await db.getUserChats({ sender: username, receiver: username });

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

  socket.on("findUser", async ({ id, receiver, sender, offset }) => {
    const db = database.getDbServiceInstance();

    const receiverData = await db.getUser({ username: receiver });
    const senderData = await db.getUser({ username: sender });
    const allMessages = await db.getUserMessages({ chatId: id, offset });

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
      const db = database.getDbServiceInstance();
      //👇🏻 Destructures the property from the object
      const { chat_id, message, sender, receiver, offset } = data;

      await db.insertMessage({
        message,
        read: 0,
        chatId: chat_id,
        senderId: sender,
        receiverId: receiver,
      });

      const receiverData = await db.getUser({ username: receiver });
      const senderData = await db.getUser({ username: sender });
      const allMessages = await db.getUserMessages({ chatId: chat_id, offset });

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
