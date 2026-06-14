import { io } from 'socket.io-client';

let socket = null;
let currentUserId = null;

/**
 * Get the socket server URL.
 * In production, connect to the API URL; in dev, use localhost.
 */
const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    // Use the same origin in production, or localhost in dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) return apiUrl;
  }
  return 'http://localhost:5000';
};

/**
 * Initializes socket connection and joins the user's personal room.
 * Safe to call multiple times — reuses existing connection.
 * @param {string} userId - ID of authenticated user
 */
export const initSocket = (userId) => {
  currentUserId = userId;

  // If already connected with the same user, just re-join
  if (socket && socket.connected) {
    socket.emit('join', userId);
    console.log('[Socket] Re-joined room for user:', userId);
    return socket;
  }

  // If socket exists but disconnected, clean up first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(getSocketUrl(), {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
    if (currentUserId) {
      socket.emit('join', currentUserId);
      console.log('[Socket] Joined room:', currentUserId);
    }
  });

  socket.on('reconnect', () => {
    console.log('[Socket] Reconnected:', socket.id);
    if (currentUserId) {
      socket.emit('join', currentUserId);
      console.log('[Socket] Re-joined room after reconnect:', currentUserId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
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
    currentUserId = null;
    console.log('[Socket] Disconnected and cleared');
  }
};
