import { Server } from "socket.io";

export function setupSocketIO(io: Server) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("sendMessage", (data: { chatId: string; senderId: string; message: string }) => {
      // In a real application, you would save the message to the database here
      // and then emit it to the chat room.
      console.log(`Message received in chat ${data.chatId} from ${data.senderId}: ${data.message}`);
      io.to(data.chatId).emit("newMessage", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
