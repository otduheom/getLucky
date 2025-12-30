import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Получает URL для WebSocket соединения
 * В продакшене использует текущий домен, в разработке - localhost или переменную окружения
 */
function getSocketUrl(): string {
  // В продакшене (когда клиент и сервер на одном домене) используем относительный путь
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // В разработке используем переменную окружения или localhost
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
}

export function initSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  // Если сокет существует, но не подключен, отключаем его
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const socketUrl = getSocketUrl();
  
  console.log('Initializing socket connection to:', socketUrl);
  
  socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'], // Добавляем polling как fallback
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Добавляем обработчики событий для отладки
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default socket;