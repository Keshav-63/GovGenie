
import { Server } from "socket.io";
import Chat from "../models/message.model.js";
import { encryptMessage, decryptMessage } from "../utils/encryption.js";

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);


    socket.on("join", async ({ userId, agentId }) => {
      if (!userId || !agentId) {
        return socket.emit("error", "Invalid userId or agentId.");
      }

      const room = `chat_${[userId.toString(), agentId.toString()]
        .sort()
        .join("_")}`;
      socket.join(room);
      onlineUsers.set(userId.toString(), socket.id);
      onlineUsers.set(agentId.toString(), socket.id);

      console.log(`User ${userId} joined room: ${room}`);

      const messages = await Chat.find({
        $or: [
          { senderId: userId.toString(), receiverId: agentId.toString() },
          { senderId: agentId.toString(), receiverId: userId.toString() },
        ],
      }).sort({ createdAt: 1 });

      socket.emit(
        "chatHistory",
        messages.map((msg) => ({
          ...msg._doc,
          text: decryptMessage(msg.text),
        }))
      );

      await Chat.updateMany(
        { receiverId: userId.toString(), status: "sent" },
        { status: "delivered" }
      );
    });

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      if (!senderId || !receiverId || !text) {
        console.error("Invalid message payload:", {
          senderId,
          receiverId,
          text,
        });
        return;
      }

      console.log(
        "Message received from sender:",
        senderId,
        "to receiver:",
        receiverId
      );

      const encryptedText = encryptMessage(text);
      const newMessage = new Chat({
        senderId,
        receiverId,
        text: encryptedText,
        status: "sent",
        createdAt: new Date(),
      });

      await newMessage.save();

      const room = `chat_${[senderId.toString(), receiverId.toString()]
        .sort()
        .join("_")}`;
      console.log(`Emitting message to room: ${room}`);

      io.to(room).emit("receiveMessage", {
        senderId,
        receiverId,
        text,
        createdAt: new Date().toISOString(),
      });

      if (!onlineUsers.has(receiverId.toString())) {
        console.log(`Receiver ${receiverId} is offline. Sending notification.`);
        io.to(onlineUsers.get(receiverId.toString())).emit(
          "newMessageNotification",
          {
            message: "📩 You have a new message!",
          }
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) onlineUsers.delete(key);
      });
    });
  });

  return io;
};

export default socketServer;