const express = require("express");
const database = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoute");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/"));

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

//Routes
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);

const db = database.getDbServiceInstance();

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
      res
        .status(200)
        .json({ message: "User already registered", user: userFound[0] });
    } else {
      const registerUser = await db.registerUser({
        username,
        mobile: "",
        status: "1",
      });

      if (registerUser) {
        console.log("User registered successfully");
        res.status(201).json({
          message: "User registered successfully",
          user: { user_id: registerUser.insertId, ...registerUser },
        });
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

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "<http://localhost:3000>",
  },
  maxHttpBufferSize: 1e8,
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

    const fetchUser = await db.getUserById({ userId: calleeId });
    const fetchUserCaller = await db.getUserById({ userId: callerId });

    let callInsert = {};

    if (callId !== 0) {
      callInsert = await db.insertCall({
        callerId: callerId,
        receiverId: calleeId,
        type: 1, // 1 for video call
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

    await db.updateCall({ callId, status: "Answered" });

    const fetchUser = await db.getUserById({ userId: calleeId });
    const fetchUserCaller = await db.getUserById({ userId: callerId });

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

    const fetchUserCaller = await db.getUserById({ userId: callerId });

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

  socket.on("addUser", async ({ senderId, receiverUsername }) => {
    const receiverUser = await db.getUser({ username: receiverUsername });
    if (receiverUser.length > 0) {
      await db.createChat({
        senderId: senderId,
        receiverId: receiverUser[0].user_id,
      });
      socket.join(receiverUser[0].socket);
      socket.emit("allMessageList");

      socket.to(receiverUser[0].socket).emit("allMessageList");
    }
  });

  socket.on(
    "sendAudio",
    async ({ audioData, chatId, senderId, receiverId, offset }) => {
      const rand = Math.floor(Math.random() * 99999999) + 1;
      const filePath = `${__dirname}/audios/${senderId + chatId + rand}.aac`;
      const senderUser = await db.getUserById({ userId: senderId });
      const receiverUser = await db.getUserById({ userId: receiverId });
      convertBase64ToAudio(audioData, filePath)
        .then(async (filePath) => {
          if (filePath) {
            const messageData = await db.insertMessage({
              message: "",
              read: false,
              chatId,
              senderId,
              receiverId: "",
            });
            await db.addAudio({
              messageId: messageData.insertId,
              audioUrl: `${senderId + chatId + rand}.aac`,
            });
            const allMessages = await db.getUserMessages({
              chatId: chatId,
              offset,
            });
            socket.emit("getNewMessage", allMessages);
            socket.emit("allMessageList");
            socket
              .to(receiverUser[0].socket)
              .emit("getNewMessage", allMessages);
            socket.to(receiverUser[0].socket).emit("allMessageList");
            socket.to(senderUser[0].socket).emit("getNewMessage", allMessages);
            socket.to(senderUser[0].socket).emit("allMessageList");
          } else {
            console.error("Failed to save audio file");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      // socket.emit("");
    }
  );

  const convertBase64ToAudio = async (base64Data, filePath) => {
    try {
      // Remove the data URI prefix if present
      const base64Content = base64Data.split(",")[1];
      // Convert the Base64 string to a buffer
      const buffer = Buffer.from(base64Content, "base64");
      // Write the buffer to a file
      await fs.promises.writeFile(filePath, buffer, "base64");
      console.log("Audio file saved successfully:", filePath);
      return filePath;
    } catch (error) {
      console.error("Error converting Base64 to audio:", error);
      return null;
    }
  };

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });

  socket.on("messageRead", async ({ chatId, userId }) => {
    await db.markChatRead({ chatId, userId });
  });

  socket.on("findUser", async ({ chatId, receiver, sender, offset }) => {
    const receiverData = await db.getUser({ username: receiver });
    const senderData = await db.getUser({ username: sender });
    const allMessages = await db.getUserMessages({ chatId, offset });

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

      socket.to(receiverData[0].socket).emit("newMessage", {
        title: sender,
        message,
      });

      socket.emit("getNewMessage", allMessages);
      socket.emit("allMessageList", "");

      if (receiverData.length > 0) {
        socket.to(receiverData[0].socket).emit("getNewMessage", allMessages);
        socket.to(receiverData[0].socket).emit("allMessageList", "");
      }
      if (senderData.length > 0) {
        socket.to(senderData[0].socket).emit("getNewMessage", allMessages);
        socket.to(senderData[0].socket).emit("allMessageList", "");
      }
    } catch (e) {
      console.log("Error in sending message", e);
    }
  });

  socket.on("uploadImage", (data) => {
    // Check if fileData is an object and contains the base64 property
    if (typeof data === "object") {
      console.log("fileData is an object", data);

      const filePath = `${__dirname}/uploads/${data.name}`;

      if (data.base64) {
        console.log("base64 property found:", data.base64);

        // Convert fileData.base64 to a Buffer
        const fileBuffer = Buffer.from(data.base64, "base64");

        fs.writeFile(filePath, fileBuffer, async (err) => {
          if (err) {
            console.log(err);
          } else {
            const senderUser = await db.getUserById({ userId: data.senderId });
            const receiverUser = await db.getUserById({
              userId: data.receiverId,
            });
            const messageData = await db.insertMessage({
              message: "",
              read: false,
              chatId: data.chatId,
              senderId: data.senderId,
              receiverId: "",
            });
            await db.addImage({
              messageId: messageData.insertId,
              imageUrl: data.name,
            });
            const allMessages = await db.getUserMessages({
              chatId: data.chatId,
              offset: data.offset,
            });
            socket.emit("getNewMessage", allMessages);
            socket.emit("allMessageList");
            socket
              .to(receiverUser[0].socket)
              .emit("getNewMessage", allMessages);
            socket.to(receiverUser[0].socket).emit("allMessageList");
            socket.to(senderUser[0].socket).emit("getNewMessage", allMessages);
            socket.to(senderUser[0].socket).emit("allMessageList");
          }
        });
      } else {
        console.error("base64 property not found");
      }
    } else {
      console.error("Invalid file data format");
    }
  });

  let writeStream = null;

  socket.on("videoChunk", ({ chunk, fileName, offsets }) => {
    const filePath = `${__dirname}/uploads/${fileName}`;

    // File path to save the video chunks
    // const filePaths = path.join(__dirname, "video_chunks", fileName);

    try {
      // Create or append the chunk to the video file
      fs.appendFileSync(filePath, Buffer.from(chunk, "base64"));

      console.log("Video chunk received and saved:", offsets);
    } catch (error) {
      console.error("Error appending video chunk:", error);
    }

    // // Append video chunk to a file or process it as needed
    // fs.appendFile(filePath, Buffer.from(chunk, "base64"), (err) => {
    //   if (err) {
    //     console.error("Error appending video chunk:", err);
    //   } else {
    //     console.log("Video chunk received");
    //   }
    // });
  });

  socket.on("videoEnd", async (data) => {
    console.log("Video transmission completed");
    const senderUser = await db.getUserById({ userId: data.senderId });
    const receiverUser = await db.getUserById({
      userId: data.receiverId,
    });
    const messageData = await db.insertMessage({
      message: "",
      read: false,
      chatId: data.chatId,
      senderId: data.senderId,
      receiverId: "",
    });
    await db.addVideo({
      messageId: messageData.insertId,
      videoUrl: data.name,
    });
    const allMessages = await db.getUserMessages({
      chatId: data.chatId,
      offset: data.offset,
    });
    socket.emit("getNewMessage", allMessages);
    socket.emit("allMessageList");
    socket.to(receiverUser[0].socket).emit("getNewMessage", allMessages);
    socket.to(receiverUser[0].socket).emit("allMessageList");
    socket.to(senderUser[0].socket).emit("getNewMessage", allMessages);
    socket.to(senderUser[0].socket).emit("allMessageList");
  });
});
