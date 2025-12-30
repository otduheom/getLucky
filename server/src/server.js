const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupSocket } = require('./socket/socketHandler');
const { setIO } = require('./socket/socketInstance');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Создаем HTTP сервер
const httpServer = createServer(app);

// Настраиваем Socket.io
// В продакшене разрешаем подключения с того же домена, в разработке - из CLIENT_URL
const socketCorsOrigin = process.env.NODE_ENV === 'production' 
  ? true // В продакшене разрешаем все подключения с того же домена
  : (process.env.CLIENT_URL || "http://localhost:5173");

const io = new Server(httpServer, {
  cors: {
    origin: socketCorsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true, // Поддержка старых версий клиентов
});

// Сохраняем экземпляр io для использования в контроллерах
setIO(io);

// Настраиваем обработчики сокетов
setupSocket(io);

// Запускаем сервер
httpServer.listen(PORT, (err) => {
  if (err) {
    console.log('error', err);
  } else {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io is ready`);
  }
});