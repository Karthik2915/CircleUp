import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, Users, Calendar, Check, CheckCheck } from 'lucide-react';
import { api, timeAgo } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Button, Card, Spinner, Badge } from '@/components/ui';
import { getSocket } from '@/lib/api';

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'hangout_invite' | 'mention' | 'poll_vote' | 'event_rsvp';
  message: string;
  read: boolean;
  createdAt: string;
  sender?: { _id: string; name: string; avatar: string };
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-red-500 fill-red-500" />,
  comment: <MessageCircle className="w-4 h-4 text-blue-500" />,
  friend_request: <Users className="w-4 h-4 text-purple-500" />,
  friend_accept: <Users className="w-4 h-4 text-green-500" />,
  hangout_invite: <Calendar className="w-4 h-4 text-orange-500" />,
  mention: <MessageCircle className="w-4 h-4 text-indigo-500" />,
  poll_vote: <span className="text-sm">📊</span>,
  event_rsvp: <span className="text-sm">📅</span>,
};

export default function NotificationsPage() {
  const { setUnreadNotifications } = useStore();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => { setNotifs(data); setLoading(false); });
    const s = getSocket();
    s.on('notification', (n: Notification) => {
      setNotifs(prev => [n, ...prev]);
    });
    return () => { s.off('notification'); };
  }, []);

  const markRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadNotifications(notifs.filter(n => !n.read && n._id !== id).length);
  };

  const markAll = async () => {
    await api.post('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifications(0);
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black dark:text-white">Notifications</h2>
          {unread > 0 && <Badge color="#ec4899">{unread} new</Badge>}
        </div>
        {unread > 0 && (
          <Button size="sm" variant="soft" icon={<CheckCheck className="w-4 h-4" />} onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> : (
        <div className="space-y-2">
          {notifs.length === 0 ? (
            <Card className="text-center py-20">
              <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <div className="font-bold text-lg text-gray-400">All caught up!</div>
            </Card>
          ) : (
            <AnimatePresence>
              {notifs.map((n, i) => (
                <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div onClick={() => !n.read && markRead(n._id)}
                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${n.read
                      ? 'bg-white dark:bg-gray-900 border-indigo-50 dark:border-gray-800'
                      : 'bg-indigo-50/60 dark:bg-indigo-900/20 border-brand-200/50 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}>
                    <div className="relative flex-shrink-0">
                      {n.sender
                        ? <Avatar src={n.sender.avatar} name={n.sender.name} size={50} />
                        : <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-xl">🔔</div>}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                        {TYPE_ICONS[n.type] || <Bell className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.read ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-900 dark:text-white font-semibold'}`}>{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2.5 h-2.5 rounded-full gradient-brand flex-shrink-0 mt-1.5" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
