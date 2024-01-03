const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

app.get("/api", (req: any, res: any) => {
    res.json(messages);
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

const generateID = () => Math.random().toString(36).substring(2, 10);

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "<http://localhost:3000>"
    }
});

let chatRooms: any = [];
let users: any = [];
let messages: any = [
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

socketIO.on("connection", (socket: any) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("createRoom", (roomName: any) => {
        socket.join(roomName);
        //👇🏻 Adds the new group name to the chat rooms array
        chatRooms.unshift({ id: generateID(), roomName, messages: [] });
        //👇🏻 Returns the updated chat rooms via another event
        socket.emit("roomsList", chatRooms);
    });

    socket.on("addUser", ({ senderId, receiverId }: any) => {
        socket.join(receiverId);
        //👇🏻 Adds the new group name to the chat rooms array
        messages.unshift({ id: generateID(), senderId, receiverId, messages: [] });
        //👇🏻 Returns the updated chat rooms via another event
        socket.emit("messagesList", messages);
    });

    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
    });

    socket.on("findRoom", (id: any) => {
        //👇🏻 Filters the array by the ID
        let result = chatRooms.filter((room: any) => room.id == id);
        //👇🏻 Sends the messages to the app
        socket.emit("foundRoom", result[0]?.messages);
    });

    socket.on("findUser", (id: string) => {
        //👇🏻 Filters the array by the ID
        let result = messages.filter((message: any) => message.id == id);
        //👇🏻 Sends the messages to the app
        socket.emit("foundUser", result[0]?.messages);
    });

    socket.on("newChatMessage", (data: any) => {
        //👇🏻 Destructures the property from the object
        const { message_id, message, sender, timestamp } = data;

        //👇🏻 Finds the room where the message was sent
        let result = messages.filter((message: any) => message.id == message_id);

        //👇🏻 Create the data structure for the message
        const newMessage = {
            id: generateID(),
            text: message,
            sender,
            time: `${timestamp.hour}:${timestamp.mins}`,
        };
        //👇🏻 Updates the chatroom messages
        socket.to(result[0].name).emit("chatMessage", newMessage);
        result[0].messages.push(newMessage);

        //👇🏻 Trigger the events to reflect the new changes
        socket.emit("messageList", messages);
        socket.emit("foundUser", result[0]?.messages);
    });

    socket.on("newMessage", (data: any) => {
        //👇🏻 Destructures the property from the object
        const { room_id, message, user, timestamp } = data;

        //👇🏻 Finds the room where the message was sent
        let result = chatRooms.filter((room: any) => room.id == room_id);

        //👇🏻 Create the data structure for the message
        const newMessage = {
            id: generateID(),
            text: message,
            user,
            time: `${timestamp.hour}:${timestamp.mins}`,
        };
        //👇🏻 Updates the chatroom messages
        socket.to(result[0].name).emit("roomMessage", newMessage);
        result[0].messages.push(newMessage);

        //👇🏻 Trigger the events to reflect the new changes
        socket.emit("roomsList", chatRooms);
        socket.emit("foundRoom", result[0]?.messages);
    });
});


