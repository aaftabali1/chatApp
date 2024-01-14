const express = require("express");
const url = require("url");
const db = require("./db");
const app = express();
const PORT = 4000;

const date = new Date();

let chatRooms = [];
let users = [];
let messages = [
  // {
  //     id: 'somthing',
  //     senderId: "aftab",
  //     receiverId: "test",
  //     messages: [
  //         {
  //             id: 'somtning',
  //             text: "Hi",
  //             time: "7:30",
  //             sender: "aftab"
  //         },
  //         {
  //             id: 'somtning',
  //             text: "Hi",
  //             time: "7:30",
  //             sender: "test"
  //         },
  //     ]
  // }
];

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

  // Use the executeQuery function
  // db.executeQuery(
  //   sql,
  //   [req.query.username, req.query.username],
  //   (error, results) => {
  //     if (error) {
  //       console.error("Error executing query:", error);
  //     } else {
  //       res.json(results);
  //     }

  //     // Don't forget to close the connection when done
  //   }
  // );

  // res.json(messages);
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

    // db.executeQuery(userSql, [username], (error, results) => {
    //   if (error) {
    //     console.error("Error registering user:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   } else {
    //     if (results.length > 0) {
    //       res.status(400).json({ message: "User already registered" });
    //     } else {
    //       // Insert the user into the database
    //       const sql =
    //         "INSERT INTO users (username, mobile, status, time) VALUES (?, ?, ?, ?)";
    //       db.executeQuery(
    //         sql,
    //         [username, "", 1, new Date()],
    //         (error, results) => {
    //           if (error) {
    //             console.error("Error registering user:", error);
    //             res.status(500).json({ error: "Internal Server Error" });
    //           } else {
    //             console.log("User registered successfully");
    //             res
    //               .status(201)
    //               .json({ message: "User registered successfully" });
    //           }
    //         }
    //       );
    //     }
    //   }
    // });
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

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected! `);

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

  socket.on("findUser", (id) => {
    //👇🏻 Filters the array by the ID
    let result = messages.filter((message) => message.id == id);
    //👇🏻 Sends the messages to the app
    socket.emit("foundUser", result[0]?.messages);
  });

  socket.on("newChatMessage", (data) => {
    //👇🏻 Destructures the property from the object
    const { message_id, message, sender, timestamp } = data;

    //👇🏻 Finds the room where the message was sent
    let result = messages.find((message) => message.id == message_id);

    //👇🏻 Create the data structure for the message
    const newMessage = {
      id: generateID(),
      text: message,
      sender,
      time: `${timestamp.hour}:${timestamp.mins}`,
      read: false,
    };
    //👇🏻 Updates the chatroom messages
    socket.to(result?.name).emit("chatMessage", newMessage);
    result?.messages.push(newMessage);

    //👇🏻 Trigger the events to reflect the new changes
    // socket.emit("messageList", messages);
    // socket.emit("foundUser", result?.messages);

    const receiverUser = users.find(
      (user) => user.username == result.receiverId
    );
    receiverUser.socket.emit("messageList", messages);
    receiverUser.socket.emit("foundUser", result?.messages);

    const senderUser = users.find((user) => user.username == result.senderId);
    senderUser.socket.emit("messageList", messages);
    senderUser.socket.emit("foundUser", result?.messages);
  });
});
