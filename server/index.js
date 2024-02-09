const express = require("express");
const database = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoute");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

//Routes
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);

const db = database.getDbServiceInstance();

app.get("/api/chats", async (req, res) => {
  try {
    const chats = await db.getAllMessagesByUsername({
      sender: req.query.username,
      receiver: req.query.username,
    });

    res.json(chats);
  } catch (e) {
    console.log("Error", e);
    res.json([]);
  }
});

app.get("/api/calls", async (req, res) => {
  try {
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

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected! `);

  socket.on("call", async (data) => {
    const { calleeId, callerId, callId, rtcMessage } = data;

    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    let callInsert = {};

    if (callId !== 0) {
      callInsert = await db.insertCall({
        callerId: callerId,
        receiverId: calleeId,
        type: "video",
      });
    } else {
      callInsert = {
        insertId: callId,
      };
    }

    socket.to(fetchUser[0].socket).emit("newCall", {
      callId: callInsert.insertId,
      callerId: fetchUserCaller[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("audioCall", async (data) => {
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

    await db.updateCall({ callId, status: "1" });

    const fetchUser = await db.getUser({ username: calleeId });
    const fetchUserCaller = await db.getUser({ username: callerId });

    socketIO.to(fetchUserCaller[0].socket).emit("audioCallAnswered", {
      callee: fetchUser[0].username,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("ICEcandidate", async (data) => {
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

    const fetchUserCaller = await db.getUser({ username: callerId });

    socket.to(fetchUserCaller[0].socket).emit("callEnd", {});
  });

  socket.on("peer:nego:needed", async ({ to, offer }) => {
    const fetchUser = await db.getUser({ username: to });

    socket
      .to(fetchUser[0].socket)
      .emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", async ({ to, ans }) => {
    socket.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("updateUser", async (username) => {
    await db.updateUser({ socket: socket.id, username });
  });

  socket.on("addUser", async ({ senderId, receiverId }) => {
    await db.createChat({ sender: senderId, receiver: receiverId });

    socket.join(receiverId);
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
  });

  socket.on("getMessages", async (username) => {
    const chats = await db.getAllMessagesByUsername({
      sender: username,
      receiver: username,
    });

    socket.emit("allMessageList", chats);
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });

  socket.on("messageRead", async ({ chatId, senderId, receiverId }) => {
    await db.markChatRead({ chatId, senderId, receiverId });
  });

  socket.on("findUser", async ({ id, receiver, sender, offset }) => {
    const receiverData = await db.getUser({ username: receiver });
    const senderData = await db.getUser({ username: sender });
    const allMessages = await db.getUserMessages({ chatId: id, offset });

    socket.emit("foundUser", allMessages);

    if (receiverData.length > 0) {
      socket.to(receiverData[0].socket).emit("foundUser", allMessages);
    }
    if (senderData.length > 0) {
      socket.to(senderData[0].socket).emit("foundUser", allMessages);
    }
  });

  socket.on("newChatMessage", async (data) => {
    try {
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

      const chatsReceiver = await db.getAllMessagesByUsername({
        sender: receiver,
        receiver,
      });
      socket.to(receiverData[0].socket).emit("newMessage", {
        title: sender,
        message,
      });

      socket.emit("getNewMessage", allMessages);
      socket.emit("allMessageList", chatsReceiver);

      if (receiverData.length > 0) {
        socket.to(receiverData[0].socket).emit("getNewMessage", allMessages);
        socket.to(receiverData[0].socket).emit("allMessageList", chatsReceiver);
      }
      if (senderData.length > 0) {
        const chatsSender = await db.getAllMessagesByUsername({
          sender,
          receiver,
        });
        socket.to(senderData[0].socket).emit("getNewMessage", allMessages);
        socket.to(senderData[0].socket).emit("allMessageList", chatsSender);
      }
    } catch (e) {
      console.log("Error in sending message", e);
    }
  });
});
