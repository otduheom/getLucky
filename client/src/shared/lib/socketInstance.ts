import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001', {
    auth: {
      token,
    },
    transports: ['websocket'],
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