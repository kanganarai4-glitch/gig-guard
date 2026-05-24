import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

let socket: Socket | null = null;

/** Connect to Socket.IO server and join the user's private room. */
export const connectSocket = (userId: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    // Join private room keyed by userId
    socket?.emit('join', userId);
  });

  socket.on('joined', (data) => {
    console.log('✅ Joined GigGuard real-time room:', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connection error:', err.message);
  });

  return socket;
};

/** Get the current socket instance. */
export const getSocket = (): Socket | null => socket;

/** Disconnect the socket (call on logout). */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Listen for risk:update events.
 * @param cb - Callback receives { score, level, message, rain, aqi, updatedAt }
 */
export const onRiskUpdate = (cb: (data: any) => void) => {
  socket?.on('risk:update', cb);
};

/**
 * Listen for payment:received events.
 * @param cb - Callback receives { amount, claimId, type, upiRef, paidAt }
 */
export const onPaymentReceived = (cb: (data: any) => void) => {
  socket?.on('payment:received', cb);
};

/** Remove all listeners (cleanup on unmount). */
export const removeSocketListeners = () => {
  socket?.off('risk:update');
  socket?.off('payment:received');
};
