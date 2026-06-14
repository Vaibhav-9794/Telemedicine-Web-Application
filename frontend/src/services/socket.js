import { io } from 'socket.io-client';

let socket = null;

/**
 * Initializes and joins the user to the socket server
 * @param {string} userId - ID of authenticated user
 */
export const initSocket = (userId) => {
  if (socket) {
    if (socket.connected) {
      socket.emit('join', userId);
    }
    return socket;
  }

  socket = io('http://localhost:5000', {
    autoConnect: true,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Successfully connected to Socket server:', socket.id);
    socket.emit('join', userId);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket server');
  });

  return socket;
};

/**
 * Get current active socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket and wipe instance
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Cleared socket connection instance');
  }
};
