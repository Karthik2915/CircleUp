import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Globe, Calendar, Edit3, Grid, BookOpen, Loader2 } from 'lucide-react';
import { api, mediaUrl, timeAgo, cn } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Button, Card, Input, Textarea, Modal, Spinner, TabBar } from '@/components/ui';

interface Post {
  _id: string; type: string; mediaUrl: string; content: string;
  likes: string[]; comments: any[]; createdAt: string;
  author: { _id: string; name: string; avatar: string };
  poll?: any; event?: any;
}

interface ProfileData {
  _id: string; name: string; email: string; avatar: string; coverPhoto: string;
  bio: string; location: string; website: string; verified: boolean;
  friends: any[]; createdAt: string;
}

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState('posts');
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', bio: '', location: '', website: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/users/${user._id}`),
      api.get(`/posts/user/${user._id}`),
    ]).then(([{ data: p }, { data: ps }]) => {
      setProfile(p); setPosts(ps);
      setDraft({ name: p.name, bio: p.bio || '', location: p.location || '', website: p.website || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?._id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me/profile', draft);
      setProfile(data); setUser(data); setEditOpen(false);
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading('avatar');
    const fd = new FormData(); fd.append('avatar', file);
    const { data } = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setProfile(p => p ? { ...p, avatar: data.avatar } : p);
    setUser({ ...user!, avatar: data.avatar });
    setUploading(null);
  };

  const handleCoverUpload = async (file: File) => {
    setUploading('cover');
    const fd = new FormData(); fd.append('cover', file);
    const { data } = await api.post('/users/me/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setProfile(p => p ? { ...p, coverPhoto: data.coverPhoto } : p);
    setUploading(null);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={36} /></div>;

  const mediaPosts = posts.filter(p => p.mediaUrl);
  const stats = [
    { label: 'Posts', value: posts.length },
    { label: 'Friends', value: profile?.friends?.length ?? 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden mb-4">
        {/* Cover photo */}
        <div className="relative h-52 group cursor-pointer" onClick={() => !uploading && coverRef.current?.click()}
          style={{ background: profile?.coverPhoto ? `url(${mediaUrl(profile.coverPhoto)}) center/cover` : 'linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)' }}>
          {!profile?.coverPhoto && <div className="absolute inset-0 flex items-center justify-center text-white/20 text-8xl font-black select-none">C</div>}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all bg-black/50 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2">
              {uploading === 'cover' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploading === 'cover' ? 'Uploading...' : 'Change Cover'}
            </div>
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
        </div>

        <div className="px-6 pb-6 dark:bg-gray-900">
          {/* Avatar row */}
          <div className="flex justify-between items-end -mt-14 mb-4">
            <div className="relative group cursor-pointer" onClick={() => !uploading && avatarRef.current?.click()}>
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-xl">
                {profile?.avatar
                  ? <img src={mediaUrl(profile.avatar)} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}>
                      {profile?.name?.[0]}
                    </div>
                }
              </div>
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all text-white">
                  {uploading === 'avatar' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </div>
            <Button variant="outline" size="sm" icon={<Edit3 className="w-4 h-4" />}
              onClick={() => {
                setDraft({ name: profile?.name || '', bio: profile?.bio || '', location: profile?.location || '', website: profile?.website || '' });
                setEditOpen(true);
              }}>
              Edit Profile
            </Button>
          </div>

          {/* Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black dark:text-white">{profile?.name}</h1>
              {profile?.verified && <span className="w-5 h-5 rounded-full gradient-brand text-white text-[10px] flex items-center justify-center font-bold">✓</span>}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">{profile?.bio || 'No bio yet.'}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
              {profile?.website && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{profile.website}</a>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black dark:text-white">{s.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tab bar */}
      <div className="mb-4">
        <TabBar tabs={[
          { id: 'posts', label: 'Posts', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'photos', label: 'Photos', icon: <Grid className="w-4 h-4" /> },
        ]} active={tab} onChange={setTab} />
      </div>

      {tab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="text-center py-16">
              <div className="text-5xl mb-3">✍️</div>
              <div className="font-bold text-lg mb-2 dark:text-white">No posts yet</div>
              <p className="text-gray-400 text-sm">Share something with your circle!</p>
            </Card>
          ) : posts.map(p => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5">
                <div className="text-sm text-gray-400 mb-2">{timeAgo(p.createdAt)}</div>
                {p.content && <p className="text-[15px] leading-relaxed mb-3 dark:text-gray-100">{p.content}</p>}
                {p.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden cursor-pointer mb-2" onClick={() => setSelectedPost(p)}>
                    {p.type === 'video'
                      ? <video src={mediaUrl(p.mediaUrl)} controls className="w-full max-h-64" />
                      : <img src={mediaUrl(p.mediaUrl)} alt="" className="w-full max-h-64 object-cover" />}
                  </div>
                )}
                {p.poll && <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-sm font-semibold text-brand-700 dark:text-brand-400">📊 Poll: {p.poll.question}</div>}
                {p.event && <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-sm font-semibold text-brand-700 dark:text-brand-400">📅 Event: {p.event.title}</div>}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 text-sm text-gray-400">
                  <span>❤️ {p.likes.length}</span>
                  <span>💬 {p.comments.length}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'photos' && (
        <Card className="p-4">
          {mediaPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📸</div>
              <div className="font-bold text-lg mb-2 dark:text-white">No photos yet</div>
              <p className="text-gray-400 text-sm">Upload photos to your posts to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {mediaPosts.map(p => (
                <div key={p._id} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedPost(p)}>
                  {p.type === 'video'
                    ? <video src={mediaUrl(p.mediaUrl)} className="w-full h-full object-cover" />
                    : <img src={mediaUrl(p.mediaUrl)} alt="" className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input label="Name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Your name" />
          <Textarea label="Bio" value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} placeholder="Tell your story..." rows={3} />
          <Input label="Location" value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="City, Country" leftIcon={<MapPin className="w-4 h-4" />} />
          <Input label="Website" value={draft.website} onChange={e => setDraft({ ...draft, website: e.target.value })} placeholder="yourwebsite.com" leftIcon={<Globe className="w-4 h-4" />} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Media lightbox */}
      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)} title="" maxWidth="max-w-2xl">
        {selectedPost?.mediaUrl && (
          selectedPost.type === 'video'
            ? <video src={mediaUrl(selectedPost.mediaUrl)} controls className="w-full rounded-xl" />
            : <img src={mediaUrl(selectedPost.mediaUrl)} alt="" className="w-full rounded-xl" />
        )}
        {selectedPost?.content && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{selectedPost.content}</p>}
      </Modal>
    </div>
  );
}
