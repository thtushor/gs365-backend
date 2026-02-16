"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = setupSocketIO;
function setupSocketIO(io) {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on("joinChat", (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat ${chatId}`);
        });
        socket.on("loggedin-user", (data) => {
            console.log("Logged in a user", { data });
            // socket.join(data.id.toString())
            socket.broadcast.emit(`logout-user-${data.id.toString()}`, data);
        });
        socket.on("sendMessage", (data) => {
            // In a real application, you would save the message to the database here
            // and then emit it to the chat room.
            console.log(`Message received in chat ${data.chatId} from ${data.senderId}: ${data.message}`, { data });
            socket.broadcast.emit("newMessage", data);
        });
        socket.on("newMessage", (data) => {
            // In a real application, you would save the message to the database here
            // and then emit it to the chat room.
            console.log(`NEW Message received in chat ${data.chatId} from ${data.senderId}: ${data.message}`, { data });
            // io.to(data.chatId).emit("newMessage", data);
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}
