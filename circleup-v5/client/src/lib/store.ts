import { create } from 'zustand';
import { api, connectSocket, disconnectSocket } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  coverPhoto: string;
  bio: string;
  location: string;
  website: string;
  verified: boolean;
  friends: User[];
  isOnline: boolean;
  createdAt: string;
}

interface AppStore {
  user: User | null;
  token: string | null;
  unreadNotifications: number;
  onlineFriends: Set<string>;
  darkMode: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setUnreadNotifications: (count: number) => void;
  setFriendOnline: (userId: string, isOnline: boolean) => void;
  toggleDarkMode: () => void;
}

const savedDark = localStorage.getItem('cu_dark') === 'true';
if (savedDark) document.documentElement.classList.add('dark');

export const useStore = create<AppStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('cu_token'),
  unreadNotifications: 0,
  onlineFriends: new Set(),
  darkMode: savedDark,

  login: (token, user) => {
    localStorage.setItem('cu_token', token);
    set({ token, user });
    connectSocket();
  },

  logout: () => {
    localStorage.removeItem('cu_token');
    disconnectSocket();
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  setUser: (user) => set({ user }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),

  setFriendOnline: (userId, isOnline) => {
    set((state) => {
      const next = new Set(state.onlineFriends);
      if (isOnline) next.add(userId);
      else next.delete(userId);
      return { onlineFriends: next };
    });
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('cu_dark', String(next));
    document.documentElement.classList.toggle('dark', next);
    set({ darkMode: next });
  },
}));
