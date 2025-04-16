// socket.js
const socketIO = require('socket.io');
const users = {}; // ✅ Khai báo danh sách user
let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // 👈 hoặc 'http://localhost:19006' nếu dùng Expo Go/Web
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Lắng nghe yêu cầu từ phía client để join vào room theo idUser
    socket.on('join', (idUser) => {
      console.log(`User ${idUser} joined the room`);
      socket.join(idUser);
    
      users[idUser] = socket.id; // ✅ Lưu socketId tương ứng userId
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

const pushNotificationToUser = (userId, notification) => {
  const socketId = users[userId];
  if (socketId) {
    console.log(`🔔 Gửi thông báo đến user: ${userId}`);
    io.to(socketId).emit("newNotification", notification);
  } else {
    console.log(`⚠️ Không tìm thấy socket cho user: ${userId}`);
  }
};


module.exports = { initSocket, pushNotificationToUser, users };
