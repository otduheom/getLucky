const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupSocket } = require('./socket/socketHandler');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Создаем HTTP сервер
const httpServer = createServer(app);

// Настраиваем Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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