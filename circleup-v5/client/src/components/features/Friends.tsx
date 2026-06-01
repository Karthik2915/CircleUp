import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Check, X, MapPin, MessageCircle } from 'lucide-react';
import { api, cn } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Button, Card, Spinner, TabBar, Badge } from '@/components/ui';

interface FriendUser {
  _id: string; name: string; avatar: string; bio: string;
  location: string; isOnline: boolean;
}

export default function FriendsPage() {
  const { user, onlineFriends } = useStore();
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<{ from: FriendUser; sentAt: string }[]>([]);
  const [suggestions, setSuggestions] = useState<FriendUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/users/me/friends'),
      api.get('/users/me/friend-requests'),
      api.get('/users/me/suggestions'),
    ]).then(([{ data: f }, { data: r }, { data: s }]) => {
      setFriends(f); setRequests(r); setSuggestions(s); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sendRequest = async (userId: string) => {
    setActionLoading(userId);
    await api.post(`/users/${userId}/friend-request`);
    setSuggestions(prev => prev.filter(s => s._id !== userId));
    setActionLoading(null);
  };

  const respond = async (requesterId: string, action: 'accept' | 'decline') => {
    setActionLoading(requesterId);
    await api.post(`/users/me/friend-requests/${requesterId}/respond`, { action });
    const req = requests.find(r => r.from._id === requesterId);
    if (action === 'accept' && req) setFriends(prev => [...prev, req.from]);
    setRequests(prev => prev.filter(r => r.from._id !== requesterId));
    setActionLoading(null);
  };

  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black dark:text-white">Friends</h2>
        <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setTab('suggestions')}>Find People</Button>
      </div>

      <div className="mb-5">
        <TabBar tabs={[
          { id: 'friends', label: `Friends${friends.length ? ` (${friends.length})` : ''}` },
          { id: 'requests', label: `Requests${requests.length ? ` · ${requests.length}` : ''}` },
          { id: 'suggestions', label: 'Suggestions' },
        ]} active={tab} onChange={setTab} />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> : (
        <>
          {tab === 'friends' && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input placeholder="Search friends..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-50 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-brand-400 shadow-sm dark:text-white dark:placeholder-gray-500" />
              </div>
              {filteredFriends.length === 0 ? (
                <Card className="text-center py-16">
                  <div className="text-5xl mb-3">👥</div>
                  <div className="font-bold text-lg mb-2 dark:text-white">{search ? 'No results' : 'No friends yet'}</div>
                  <p className="text-gray-400 text-sm mb-5">Connect with people to grow your circle</p>
                  <Button onClick={() => setTab('suggestions')}>Find People</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFriends.map((f, i) => (
                    <motion.div key={f._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-5 flex flex-col items-center text-center gap-3">
                        <Avatar src={f.avatar} name={f.name} size={72} online={onlineFriends.has(f._id)} />
                        <div>
                          <div className="font-bold text-[15px] dark:text-white">{f.name}</div>
                          {f.location && <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{f.location}</div>}
                          {f.bio && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{f.bio}</p>}
                        </div>
                        <Badge color={onlineFriends.has(f._id) ? '#10b981' : '#9ca3af'}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: 'currentColor' }} />
                          {onlineFriends.has(f._id) ? 'Online' : 'Offline'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="soft" icon={<MessageCircle className="w-3.5 h-3.5" />}>Message</Button>
                          <Button size="sm" variant="ghost">Profile</Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'requests' && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <Card className="text-center py-16">
                  <div className="text-5xl mb-3">🎉</div>
                  <div className="font-bold text-lg dark:text-white">No pending requests</div>
                </Card>
              ) : requests.map((r, i) => (
                <motion.div key={r.from._id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="p-4 flex items-center gap-4">
                    <Avatar src={r.from.avatar} name={r.from.name} size={56} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[15px] dark:text-white">{r.from.name}</div>
                      {r.from.bio && <p className="text-sm text-gray-400 truncate">{r.from.bio}</p>}
                      {r.from.location && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{r.from.location}</div>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" loading={actionLoading === r.from._id} onClick={() => respond(r.from._id, 'accept')}>
                        <Check className="w-4 h-4" /> Accept
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => respond(r.from._id, 'decline')}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'suggestions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.length === 0 ? (
                <div className="col-span-2">
                  <Card className="text-center py-16">
                    <div className="text-5xl mb-3">✨</div>
                    <div className="font-bold text-lg dark:text-white">No suggestions right now</div>
                    <p className="text-gray-400 text-sm mt-2">You may already know everyone here!</p>
                  </Card>
                </div>
              ) : suggestions.map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-5 flex flex-col items-center text-center gap-3">
                    <Avatar src={s.avatar} name={s.name} size={72} />
                    <div>
                      <div className="font-bold text-[15px] dark:text-white">{s.name}</div>
                      {s.location && <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{s.location}</div>}
                    </div>
                    <Button size="sm" loading={actionLoading === s._id} onClick={() => sendRequest(s._id)} icon={<UserPlus className="w-3.5 h-3.5" />}>
                      Add Friend
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
