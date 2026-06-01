import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Check, MapPin, Loader2, Users, FileText, Hash } from 'lucide-react';
import { api, mediaUrl, timeAgo, cn } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Badge, Button, Card } from '@/components/ui';

interface UserResult {
  _id: string; name: string; email: string; avatar: string;
  bio: string; location: string; verified: boolean; isOnline: boolean;
  isFriend?: boolean; requestSent?: boolean;
}
interface PostResult {
  _id: string; content: string; type: string; mediaUrl: string;
  author: { _id: string; name: string; avatar: string };
  likes: string[]; comments: any[]; createdAt: string;
}

const RECENT_KEY = 'cu_recent_searches';
function getRecent(): string[] { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
function addRecent(q: string) {
  const prev = getRecent().filter(s => s !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 8)));
}

export default function SearchPage({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { user, onlineFriends } = useStore();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'people' | 'posts'>('people');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(getRecent());
  const [actionId, setActionId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setUsers([]); setPosts([]); return; }
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const doSearch = async (q: string) => {
    setLoading(true);
    addRecent(q); setRecent(getRecent());
    try {
      const [uRes, pRes] = await Promise.all([
        api.get(`/users/search?q=${encodeURIComponent(q)}`),
        api.get(`/posts/explore?q=${encodeURIComponent(q)}`),
      ]);
      const meRes = await api.get('/users/me');
      const friendIds = new Set((meRes.data.friends || []).map((f: any) => f._id || f));
      const sentIds = new Set((meRes.data.sentRequests || []).map((id: any) => id.toString()));
      setUsers(uRes.data.map((u: UserResult) => ({ ...u, isFriend: friendIds.has(u._id), requestSent: sentIds.has(u._id) })));
      setPosts(pRes.data.slice(0, 20));
    } catch { } finally { setLoading(false); }
  };

  const sendRequest = async (userId: string) => {
    setActionId(userId);
    await api.post(`/users/${userId}/friend-request`);
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, requestSent: true } : u));
    setActionId(null);
  };

  const clearRecent = () => { localStorage.removeItem(RECENT_KEY); setRecent([]); };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search people, posts..."
          className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 border border-indigo-100 dark:border-gray-700 rounded-2xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 shadow-sm font-medium transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent searches */}
      {!query && recent.length > 0 && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Recent searches</span>
            <button onClick={clearRecent} className="text-xs text-brand-500 font-semibold hover:underline">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map(r => (
              <button key={r} onClick={() => setQuery(r)}
                className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-brand-600 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium transition-all">
                <Hash className="w-3.5 h-3.5" />{r}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Suggested people when no query */}
      {!query && (
        <Card className="p-5">
          <div className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4">👥 People you might know</div>
          <SuggestedPeople onSendRequest={sendRequest} actionId={actionId} />
        </Card>
      )}

      {/* Search results */}
      {query && (
        <>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-4 w-fit">
            {([
              { id: 'people', icon: Users, label: `People${users.length ? ` (${users.length})` : ''}` },
              { id: 'posts',  icon: FileText, label: `Posts${posts.length ? ` (${posts.length})` : ''}` },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  tab === t.id ? 'gradient-brand text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-2 py-14">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <span className="text-sm text-gray-400">Searching...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {tab === 'people' && (
                  <div className="space-y-3">
                    {users.length === 0 ? (
                      <Card className="text-center py-14">
                        <div className="text-5xl mb-3">🔍</div>
                        <div className="font-bold text-lg dark:text-white">No people found</div>
                        <p className="text-gray-400 text-sm mt-1">Try a different name or email</p>
                      </Card>
                    ) : users.map((u, i) => (
                      <motion.div key={u._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Card className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
                          <Avatar src={u.avatar} name={u.name} size={56} online={onlineFriends.has(u._id)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-[15px] dark:text-white">
                              {u.name}
                              {u.verified && <span className="w-4 h-4 rounded-full gradient-brand text-white text-[9px] flex items-center justify-center">✓</span>}
                              {u.isFriend && <Badge color="#10b981" className="text-[10px] py-0">Friends</Badge>}
                            </div>
                            {u.bio && <p className="text-sm text-gray-400 truncate mt-0.5">{u.bio}</p>}
                            {u.location && <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><MapPin className="w-3 h-3" />{u.location}</div>}
                          </div>
                          {!u.isFriend && (
                            u.requestSent
                              ? <Button size="sm" variant="secondary" icon={<Check className="w-3.5 h-3.5" />} disabled>Sent</Button>
                              : <Button size="sm" loading={actionId === u._id} onClick={() => sendRequest(u._id)} icon={<UserPlus className="w-3.5 h-3.5" />}>Add</Button>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {tab === 'posts' && (
                  <div className="space-y-3">
                    {posts.length === 0 ? (
                      <Card className="text-center py-14">
                        <div className="text-5xl mb-3">📝</div>
                        <div className="font-bold text-lg dark:text-white">No posts found</div>
                        <p className="text-gray-400 text-sm mt-1">Try different keywords</p>
                      </Card>
                    ) : posts.map((p, i) => (
                      <motion.div key={p._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar src={p.author.avatar} name={p.author.name} size={38} />
                            <div>
                              <div className="font-bold text-sm dark:text-white">{p.author.name}</div>
                              <div className="text-xs text-gray-400">{timeAgo(p.createdAt)}</div>
                            </div>
                            <Badge color="#6366f1" className="ml-auto text-[10px]">{p.type}</Badge>
                          </div>
                          {p.content && <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{p.content}</p>}
                          {p.mediaUrl && p.type === 'image' && (
                            <div className="rounded-xl overflow-hidden">
                              <img src={mediaUrl(p.mediaUrl)} alt="" className="w-full h-32 object-cover" />
                            </div>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-400">
                            <span>❤️ {p.likes.length}</span>
                            <span>💬 {p.comments.length}</span>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}

function SuggestedPeople({ onSendRequest, actionId }: { onSendRequest: (id: string) => void; actionId: string | null }) {
  const { onlineFriends } = useStore();
  const [suggestions, setSuggestions] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/suggestions')
      .then(({ data }) => { setSuggestions(data.slice(0, 6)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>;
  if (!suggestions.length) return <p className="text-gray-400 text-sm text-center py-4">No suggestions right now</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {suggestions.map((u, i) => (
        <motion.div key={u._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all gap-2">
            <Avatar src={u.avatar} name={u.name} size={56} online={onlineFriends.has(u._id)} />
            <div className="min-w-0 w-full">
              <div className="font-bold text-sm truncate dark:text-white">{u.name}</div>
              {u.location && <div className="text-xs text-gray-400 truncate">{u.location}</div>}
            </div>
            <Button size="xs" onClick={() => onSendRequest(u._id)} loading={actionId === u._id}
              icon={<UserPlus className="w-3 h-3" />}>Add</Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
