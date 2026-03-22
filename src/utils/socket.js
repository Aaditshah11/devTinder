const socket = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");

      console.log(firstName + " joined the room: " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, message }) => {
        try {
          const roomId = [userId, targetUserId].sort().join("_");
          console.log(message);
          console.log(firstName + " : " + message);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text: message,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", {
            firstName,
            message,
            userId,
          });
        } catch (err) {
          console.log(err);
        }
      },
    );

    socket.on("disconnectChat", () => {});
  });
};

module.exports = { initializeSocket };
