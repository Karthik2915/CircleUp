import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar } from 'lucide-react';
import { api, mediaUrl } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Button, Card, Input, Textarea, Modal, Spinner, TabBar, Badge } from '@/components/ui';
import { getSocket } from '@/lib/api';

interface Hangout {
  _id: string; title: string; description: string; category: string;
  date: string; time: string; location: string; maxAttendees: number;
  attendees: { _id: string; name: string; avatar: string }[];
  organizer: { _id: string; name: string; avatar: string };
  image: string; tags: string[]; createdAt: string;
}

const CATEGORY_IMGS: Record<string, string> = {
  '☕ Social':        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=300&fit=crop',
  '🏔️ Outdoor':      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=300&fit=crop',
  '🎬 Entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=300&fit=crop',
  '🧘 Fitness':       'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop',
  '🍕 Food':          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop',
  '🎵 Music':         'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
  '📸 Photography':   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=300&fit=crop',
  '📚 Learning':      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=300&fit=crop',
};

export default function HangoutsPage() {
  const { user } = useStore();
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [tab, setTab] = useState('discover');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: '☕ Social', date: '', time: '', location: '', max: 20 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/hangouts').then(({ data }) => { setHangouts(data); setLoading(false); });
    const s = getSocket();
    s.on('new_hangout', (h: Hangout) => setHangouts(prev => [h, ...prev]));
    s.on('hangout_updated', (h: Hangout) => setHangouts(prev => prev.map(x => x._id === h._id ? h : x)));
    return () => { s.off('new_hangout'); s.off('hangout_updated'); };
  }, []);

  const toggle = async (id: string) => {
    setActionId(id);
    const { data } = await api.post(`/hangouts/${id}/join`);
    setHangouts(prev => prev.map(h => h._id === id ? { ...h, attendees: data.attendees } : h));
    setActionId(null);
  };

  const create = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k === 'max' ? 'maxAttendees' : k, String(v)));
      const { data } = await api.post('/hangouts', fd);
      setHangouts(prev => [data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', description: '', category: '☕ Social', date: '', time: '', location: '', max: 20 });
    } finally { setCreating(false); }
  };

  const myHangouts = hangouts.filter(h => h.attendees.some(a => a._id === user?._id));
  const shown = tab === 'mine' ? myHangouts : hangouts;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black dark:text-white">Hangouts</h2>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>Create</Button>
      </div>

      <div className="mb-5">
        <TabBar tabs={[
          { id: 'discover', label: 'Discover' },
          { id: 'mine', label: `Joined (${myHangouts.length})` },
        ]} active={tab} onChange={setTab} />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> : (
        <div className="space-y-5">
          {shown.length === 0 ? (
            <Card className="text-center py-16">
              <div className="text-5xl mb-3">📅</div>
              <div className="font-bold text-lg mb-2 dark:text-white">
                {tab === 'mine' ? "You haven't joined any hangouts" : 'No hangouts yet'}
              </div>
              <Button onClick={() => setShowCreate(true)} className="mt-2">Create a Hangout</Button>
            </Card>
          ) : shown.map((h, i) => {
            const isJoined = h.attendees.some(a => a._id === user?._id);
            const coverImg = h.image ? mediaUrl(h.image) : (CATEGORY_IMGS[h.category] || CATEGORY_IMGS['☕ Social']);
            return (
              <motion.div key={h._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="overflow-hidden">
                  <div className="relative h-44">
                    <img src={coverImg} alt={h.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/40 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">{h.category}</span>
                    </div>
                    {isJoined && (
                      <div className="absolute top-3 right-3 gradient-brand text-white text-xs font-bold px-3 py-1 rounded-full">✓ Joined</div>
                    )}
                    <h3 className="absolute bottom-3 left-4 text-white font-black text-xl drop-shadow">{h.title}</h3>
                  </div>

                  <div className="p-5">
                    {h.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{h.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-400" />{h.date} at {h.time}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-400" />{h.location}</span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {h.attendees.slice(0, 5).map((a, idx) => (
                            <div key={a._id} className="-ml-2 first:ml-0 border-2 border-white dark:border-gray-900 rounded-full" style={{ zIndex: 5 - idx }}>
                              <Avatar src={a.avatar} name={a.name} size={30} />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-brand-600">{h.attendees.length}</span>/{h.maxAttendees} going
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Avatar src={h.organizer.avatar} name={h.organizer.name} size={22} />
                          <span>by <span className="font-semibold text-gray-600 dark:text-gray-300">{h.organizer.name}</span></span>
                        </div>
                        <Button size="sm" variant={isJoined ? 'ghost' : 'primary'}
                          loading={actionId === h._id} onClick={() => toggle(h._id)}>
                          {isJoined ? 'Leave' : 'Join'}
                        </Button>
                      </div>
                    </div>

                    {h.tags?.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-3">
                        {h.tags.map(tag => (
                          <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-brand-600 dark:text-brand-400 font-semibold px-2.5 py-1 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create a Hangout">
        <div className="space-y-4">
          <Input label="Title" placeholder="What's the hangout called?" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-brand-500">
              {Object.keys(CATEGORY_IMGS).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Textarea label="Description" placeholder="Tell people what to expect..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <Input label="Location" placeholder="Where is it?" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })} leftIcon={<MapPin className="w-4 h-4" />} />
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">Max attendees</label>
            <input type="number" min={2} max={500} value={form.max}
              onChange={e => setForm({ ...form, max: +e.target.value })}
              className="w-24 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={create} loading={creating} disabled={!form.title.trim()}>Create 🎉</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
