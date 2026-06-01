import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, MessageCircle, Calendar, Map, Bell, User, LogOut, Search, Moon, Sun } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useStore } from '@/lib/store';
import { cn, mediaUrl } from '@/lib/api';

const NAV = [
  { id: 'feed',          label: 'Home',          icon: Home },
  { id: 'search',        label: 'Search',        icon: Search },
  { id: 'friends',       label: 'Friends',       icon: Users },
  { id: 'chat',          label: 'Messages',      icon: MessageCircle },
  { id: 'hangouts',      label: 'Hangouts',      icon: Calendar },
  { id: 'explore',       label: 'Explore',       icon: Map },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile',       label: 'Profile',       icon: User },
];

interface SidebarProps {
  active: string;
  onChange: (tab: string) => void;
  unreadMsgs: number;
  unreadNotifs: number;
  onlineCount: number;
  onClose?: () => void;
}

export default function Sidebar({ active, onChange, unreadMsgs, unreadNotifs, onlineCount, onClose }: SidebarProps) {
  const { user, logout, darkMode, toggleDarkMode } = useStore();
  const badges: Record<string, number> = { chat: unreadMsgs, notifications: unreadNotifs };

  return (
    <motion.aside
      className="w-60 h-full bg-[#0f0e17] flex flex-col py-6 px-3 overflow-y-auto"
      initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-lg font-black text-white flex-shrink-0">C</div>
        <span className="text-xl font-black text-white tracking-tight">CircleUp</span>
      </div>

      {/* Online pill */}
      <div className="mx-2 mb-5 px-3 py-2 rounded-xl bg-white/5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <span className="text-xs font-semibold text-indigo-300">{onlineCount} online now</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const badge = badges[item.id] || 0;
          return (
            <motion.button
              key={item.id}
              onClick={() => { onChange(item.id); onClose?.(); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all relative',
                isActive
                  ? 'gradient-brand text-white shadow-lg shadow-brand-500/30'
                  : 'text-indigo-300 hover:bg-white/5 hover:text-white'
              )}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={!isActive ? { x: 3 } : {}}
              whileTap={{ scale: 0.97 }}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {badge > 0 && (
                <span className="ml-auto bg-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="mt-2 mx-2">
        <button onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-indigo-300 hover:bg-white/5 hover:text-white transition-all">
          {darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* User card */}
      <div className="mt-2 border-t border-white/10 pt-4 px-2">
        <button
          onClick={() => { onChange('profile'); onClose?.(); }}
          className="flex items-center gap-3 w-full mb-3 rounded-xl p-1 hover:bg-white/5 transition-all">
          <Avatar src={user?.avatar} name={user?.name} size={38} online={true} />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-white font-bold text-sm truncate">{user?.name}</div>
            <div className="text-indigo-400 text-xs truncate">{user?.email}</div>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
