import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// ── Axios instance ─────────────────────────────────────────────
export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cu_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Socket.io instance ─────────────────────────────────────────
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // In dev: Vite proxies /socket.io → localhost:5000 so origin works fine
    // In prod: same origin serves both frontend and backend
    socket = io(window.location.origin, {
      auth: { token: localStorage.getItem('cu_token') },
      transports: ['websocket', 'polling'], // polling fallback for reliability
      autoConnect: false,
      path: '/socket.io',
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
  socket = null; // reset so reconnect creates fresh instance with updated token
};

// ── Helpers ─────────────────────────────────────────────────────
// Relative /uploads paths are proxied by Vite in dev, served directly in prod
export const mediaUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // already absolute (seed data, external URLs)
  return path; // relative paths like /uploads/xxx.jpg — proxy handles it
};

export const timeAgo = (date: string | Date): string => {
  const d = (Date.now() - new Date(date).getTime()) / 1000;
  if (d < 60) return 'Just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
