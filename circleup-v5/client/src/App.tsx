import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { api, connectSocket, getSocket } from '@/lib/api';
import { useStore } from '@/lib/store';
import AuthPage from '@/components/auth/AuthPage';
import Sidebar from '@/components/navigation/Sidebar';
import FeedPage from '@/components/features/Feed';
import FriendsPage from '@/components/features/Friends';
import ChatPage from '@/components/features/Chat';
import HangoutsPage from '@/components/features/Hangouts';
import ExplorePage from '@/components/features/Explore';
import NotificationsPage from '@/components/features/Notifications';
import ProfilePage from '@/components/features/Profile';
import SearchPage from '@/components/features/Search';

function LoadingScreen() {
  return (
    <div className="min-h-screen gradient-brand flex flex-col items-center justify-center gap-6">
      <motion.div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-5xl font-black text-white shadow-2xl"
        animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}>C</motion.div>
      <div className="text-center">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">CircleUp</h1>
        <p className="text-white/60 mb-8">Connecting people, creating memories</p>
        <div className="flex gap-2 justify-center">
          {[0,1,2,3].map(i => (
            <motion.div key={i} className="w-2 h-8 bg-white/50 rounded-full"
              animate={{ scaleY: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { setUnreadNotifications, setFriendOnline, onlineFriends } = useStore();
  const [activeTab, setActiveTab] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const s = connectSocket();
    api.get('/notifications/unread-count').then(({ data }) => {
      setUnreadNotifications(data.count);
      setUnreadNotifs(data.count);
    });
    s.on('online_friends', (ids: string[]) => ids.forEach(id => setFriendOnline(id, true)));
    s.on('friend_online', ({ userId, isOnline }: any) => setFriendOnline(userId, isOnline));
    s.on('notification', () => setUnreadNotifs(n => n + 1));
    s.on('message_preview', () => setUnreadMsgs(n => n + 1));
    return () => { ['online_friends', 'friend_online', 'notification', 'message_preview'].forEach(e => s.off(e)); };
  }, []);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (tab === 'notifications') { setUnreadNotifs(0); setUnreadNotifications(0); }
    if (tab === 'chat') setUnreadMsgs(0);
  };

  const TABS: Record<string, React.ReactNode> = {
    feed: <FeedPage />,
    search: <SearchPage onNavigate={changeTab} />,
    friends: <FriendsPage />,
    chat: <ChatPage />,
    hangouts: <HangoutsPage />,
    explore: <ExplorePage />,
    notifications: <NotificationsPage />,
    profile: <ProfilePage />,
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f8] dark:bg-gray-950 transition-colors duration-300">
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-60 z-30">
        <Sidebar active={activeTab} onChange={changeTab}
          unreadMsgs={unreadMsgs} unreadNotifs={unreadNotifs} onlineCount={onlineFriends.size} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />
            <motion.div className="fixed left-0 top-0 h-full z-50 lg:hidden"
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <Sidebar active={activeTab} onChange={changeTab}
                unreadMsgs={unreadMsgs} unreadNotifs={unreadNotifs}
                onlineCount={onlineFriends.size} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-indigo-50 dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center gap-3 transition-colors duration-300">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-5 h-5 dark:text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-lg capitalize dark:text-white">{activeTab === 'feed' ? 'Home' : activeTab}</h1>
          </div>
          <button onClick={() => changeTab('search')}
            className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-500 dark:text-gray-400 hover:text-brand-600 rounded-xl px-4 py-2 text-sm font-medium transition-all">
            🔍 Search...
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {onlineFriends.size} online
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {TABS[activeTab] || <FeedPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppBootstrap() {
  const { token, login, logout } = useStore();
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => { login(token, data.user); setLoading(false); })
      .catch(() => { logout(); setLoading(false); });
  }, []);

  if (loading) return <LoadingScreen />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppBootstrap;
