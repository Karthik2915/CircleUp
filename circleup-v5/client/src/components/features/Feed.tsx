import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Image, Video, BarChart3, Calendar, MapPin, Plus, X, Loader2, Camera,
  Edit2, Trash2, Check, Globe, Users, Lock
} from 'lucide-react';
import { api, timeAgo, cn, mediaUrl } from '@/lib/api';
import { getSocket } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Button, Card, Textarea, Badge, Modal, Spinner, TabBar } from '@/components/ui';
import StoriesStrip from './Stories';

// ── Types ──────────────────────────────────────────────────────────
interface PollOption { _id: string; text: string; votes: string[] }
interface Comment { _id: string; user: { _id: string; name: string; avatar: string }; text: string; createdAt: string }
interface Post {
  _id: string;
  author: { _id: string; name: string; avatar: string; verified: boolean };
  content: string;
  type: 'text' | 'image' | 'video' | 'poll' | 'event' | 'share';
  mediaUrl: string;
  location: string;
  visibility: 'public' | 'friends' | 'private';
  likes: string[];
  bookmarks: string[];
  comments: Comment[];
  shares: number;
  editedAt?: string;
  sharedFrom?: Post | null;
  poll?: { question: string; options: PollOption[]; endsAt: string };
  event?: { title: string; date: string; time: string; location: string; maxAttendees: number; attendees: string[]; category: string };
  createdAt: string;
}

// ── Stories Strip (inline) ─────────────────────────────────────────
function StoriesStripWrapper({ onOpenCreate }: { onOpenCreate: () => void }) {
  return <StoriesStrip onOpenCreate={onOpenCreate} />;
}

// ── Create Story Modal ─────────────────────────────────────────────
function CreateStoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File) => {
    setFile(f); setFileType(f.type.startsWith('video') ? 'video' : 'image');
    const r = new FileReader(); r.onload = e => setPreview(e.target?.result as string); r.readAsDataURL(f);
  };
  const submit = async () => {
    if (!file) return; setLoading(true);
    const fd = new FormData(); fd.append('media', file); fd.append('caption', caption);
    await api.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setLoading(false); setPreview(''); setFile(null); setCaption(''); onClose();
  };

  return (
    <Modal open={open} onClose={() => { setPreview(''); setFile(null); onClose(); }} title="Add to Your Story">
      {!preview ? (
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-14 text-center cursor-pointer hover:border-brand-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
          <Camera className="w-12 h-12 text-brand-300 mx-auto mb-3" />
          <p className="font-bold text-brand-600 mb-1">Upload photo or video</p>
          <p className="text-xs text-gray-400">Disappears in 24 hours</p>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden aspect-[9/16] max-h-72 bg-black relative">
            {fileType === 'video'
              ? <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
              : <img src={preview} alt="" className="w-full h-full object-cover" />}
            <button onClick={() => { setPreview(''); setFile(null); }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input placeholder="Add a caption..." value={caption} onChange={e => setCaption(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
          <Button full onClick={submit} loading={loading}>📤 Share Story</Button>
        </div>
      )}
    </Modal>
  );
}

// ── Share Post Modal ───────────────────────────────────────────────
function ShareModal({ post, open, onClose, onShared }: { post: Post; open: boolean; onClose: () => void; onShared: (p: Post) => void }) {
  const { user } = useStore();
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('sharedFrom', post._id);
      fd.append('content', caption);
      fd.append('type', 'share');
      const { data } = await api.post('/posts', fd);
      onShared(data); onClose(); setCaption('');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Post">
      <div className="space-y-4">
        <div className="flex gap-3 items-start">
          <Avatar src={user?.avatar} name={user?.name} size={40} />
          <Textarea placeholder="Add a thought..." value={caption} onChange={e => setCaption(e.target.value)} rows={2} />
        </div>
        {/* Preview of original post */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={post.author.avatar} name={post.author.name} size={28} />
            <span className="font-bold text-sm dark:text-white">{post.author.name}</span>
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{post.content}</p>
          {post.mediaUrl && (
            <img src={mediaUrl(post.mediaUrl)} alt="" className="w-full max-h-40 object-cover rounded-xl mt-2" />
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} full>Cancel</Button>
          <Button onClick={submit} loading={loading} full>Share Now</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Edit Post Modal ────────────────────────────────────────────────
function EditPostModal({ post, open, onClose, onUpdated }: { post: Post; open: boolean; onClose: () => void; onUpdated: (p: Post) => void }) {
  const [content, setContent] = useState(post.content);
  const [location, setLocation] = useState(post.location);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(post.visibility || 'public');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/posts/${post._id}`, { content, location, visibility });
      onUpdated(data); onClose();
    } finally { setLoading(false); }
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can see' },
    { value: 'friends', label: 'Friends', icon: Users, desc: 'Your friends only' },
    { value: 'private', label: 'Private', icon: Lock, desc: 'Only you' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Edit Post">
      <div className="space-y-4">
        <Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="What's on your mind?" />
        <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Add location..." className="flex-1 bg-transparent text-sm outline-none dark:text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Visibility</label>
          <div className="grid grid-cols-3 gap-2">
            {visibilityOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <button key={opt.value} onClick={() => setVisibility(opt.value as any)}
                  className={cn('flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center',
                    visibility === opt.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300')}>
                  <Icon className={cn('w-4 h-4', visibility === opt.value ? 'text-brand-600' : 'text-gray-400')} />
                  <span className={cn('text-xs font-bold', visibility === opt.value ? 'text-brand-600' : 'text-gray-500 dark:text-gray-400')}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} full>Cancel</Button>
          <Button onClick={save} loading={loading} disabled={!content.trim()} full>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Create Post Modal ──────────────────────────────────────────────
function CreatePostModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (p: Post) => void }) {
  const { user } = useStore();
  const [type, setType] = useState<'text' | 'image' | 'video' | 'poll' | 'event'>('text');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState(['', '', '']);
  const [ev, setEv] = useState({ title: '', date: '', time: '', location: '', max: 20, category: '☕ Social' });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setType('text'); setContent(''); setLocation(''); setMediaFile(null); setMediaPreview('');
    setPollQ(''); setPollOpts(['', '', '']); setEv({ title: '', date: '', time: '', location: '', max: 20, category: '☕ Social' });
  };
  const handleFile = (file: File) => {
    setMediaFile(file);
    const reader = new FileReader(); reader.onload = e => setMediaPreview(e.target?.result as string); reader.readAsDataURL(file);
  };
  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', type); fd.append('content', content); fd.append('location', location);
      if (mediaFile) fd.append('media', mediaFile);
      if (type === 'poll') { fd.append('pollQuestion', pollQ); fd.append('pollOptions', JSON.stringify(pollOpts.filter(o => o.trim()))); }
      if (type === 'event') { fd.append('eventTitle', ev.title); fd.append('eventDate', ev.date); fd.append('eventTime', ev.time); fd.append('eventLocation', ev.location); fd.append('eventMax', String(ev.max)); fd.append('eventCategory', ev.category); }
      const { data } = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onCreated(data); reset(); onClose();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const isValid = type === 'text' ? content.trim().length > 0 : type === 'poll' ? pollQ.trim() && pollOpts.filter(o => o.trim()).length >= 2 : type === 'event' ? ev.title.trim().length > 0 : true;

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Create Post" maxWidth="max-w-xl">
      <div className="flex gap-2 mb-5 flex-wrap">
        {([{ id: 'text', icon: '✏️', label: 'Text' }, { id: 'image', icon: '📷', label: 'Photo' }, { id: 'video', icon: '🎬', label: 'Video' }, { id: 'poll', icon: '📊', label: 'Poll' }, { id: 'event', icon: '📅', label: 'Event' }] as const).map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={cn('px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all', type === t.id ? 'gradient-brand text-white shadow' : 'bg-indigo-50 dark:bg-indigo-900/30 text-brand-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/60')}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3 items-center mb-4">
        <Avatar src={user?.avatar} name={user?.name} size={44} />
        <div>
          <div className="font-bold dark:text-white">{user?.name}</div>
          <div className="text-xs text-gray-400">Posting publicly</div>
        </div>
      </div>
      <Textarea placeholder="What's on your mind?" value={content} onChange={e => setContent(e.target.value)} rows={3} className="mb-3" />

      {(type === 'image' || type === 'video') && (
        <div className="mb-4">
          {!mediaPreview ? (
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
              {type === 'image' ? <Image className="w-10 h-10 text-brand-400 mx-auto mb-2" /> : <Video className="w-10 h-10 text-brand-400 mx-auto mb-2" />}
              <p className="text-sm font-semibold text-brand-600">Click to upload {type === 'image' ? 'photo' : 'video'}</p>
              <p className="text-xs text-gray-400 mt-1">Max 50MB</p>
              <input ref={fileRef} type="file" accept={type === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              {type === 'video' ? <video src={mediaPreview} controls className="w-full max-h-64 bg-black" /> : <img src={mediaPreview} alt="" className="w-full max-h-64 object-cover" />}
              <button onClick={() => { setMediaFile(null); setMediaPreview(''); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {type === 'poll' && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 mb-4 space-y-3">
          <input className="w-full border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" placeholder="Ask a question..." value={pollQ} onChange={e => setPollQ(e.target.value)} />
          {pollOpts.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input className="flex-1 border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" placeholder={`Option ${i + 1}`} value={opt} onChange={e => setPollOpts(p => { const n = [...p]; n[i] = e.target.value; return n; })} />
              {i > 1 && <button onClick={() => setPollOpts(p => p.filter((_, j) => j !== i))} className="p-2 rounded-xl bg-red-50 text-red-500"><X className="w-4 h-4" /></button>}
            </div>
          ))}
          {pollOpts.length < 5 && <button onClick={() => setPollOpts(p => [...p, ''])} className="text-sm font-semibold text-brand-600 hover:underline">+ Add option</button>}
        </div>
      )}

      {type === 'event' && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 mb-4 space-y-3">
          <input className="w-full border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" placeholder="Event title" value={ev.title} onChange={e => setEv({ ...ev, title: e.target.value })} />
          <div className="flex gap-2">
            <input type="date" className="flex-1 border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" value={ev.date} onChange={e => setEv({ ...ev, date: e.target.value })} />
            <input type="time" className="flex-1 border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" value={ev.time} onChange={e => setEv({ ...ev, time: e.target.value })} />
          </div>
          <input className="w-full border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" placeholder="📍 Location" value={ev.location} onChange={e => setEv({ ...ev, location: e.target.value })} />
          <div className="flex gap-2 items-center">
            <select className="flex-1 border border-indigo-200 dark:border-indigo-700 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white" value={ev.category} onChange={e => setEv({ ...ev, category: e.target.value })}>
              {['☕ Social', '🏔️ Outdoor', '🎬 Entertainment', '🧘 Fitness', '🍕 Food', '🎵 Music', '📸 Photography', '📚 Learning'].map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 dark:text-white border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 py-2">
              <span className="text-xs text-gray-500">Max:</span>
              <input type="number" min={2} max={500} value={ev.max} onChange={e => setEv({ ...ev, max: +e.target.value })} className="w-14 text-sm outline-none font-semibold dark:bg-gray-800 dark:text-white" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        <MapPin className="w-4 h-4 text-gray-400" />
        <input placeholder="Add location (optional)" value={location} onChange={e => setLocation(e.target.value)} className="flex-1 outline-none bg-transparent text-sm text-gray-500 dark:text-gray-400 placeholder:text-gray-400" />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
        <Button onClick={submit} loading={loading} disabled={!isValid}>Share Post</Button>
      </div>
    </Modal>
  );
}

const REACTIONS = [{ emoji: '❤️', label: 'Love' }, { emoji: '👍', label: 'Like' }, { emoji: '😂', label: 'Haha' }, { emoji: '😮', label: 'Wow' }, { emoji: '😢', label: 'Sad' }, { emoji: '😡', label: 'Angry' }];

// ── Post Card ──────────────────────────────────────────────────────
function PostCard({ post, userId, onUpdate, onDelete, onShare }: {
  post: Post; userId: string;
  onUpdate: (p: Post) => void;
  onDelete: (id: string) => void;
  onShare: (p: Post) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isMe = post.author._id === userId;
  const liked = post.likes.includes(userId);
  const bookmarked = post.bookmarks.includes(userId);
  const myVote = post.poll?.options.findIndex(o => o.votes.includes(userId)) ?? -1;
  const totalVotes = post.poll?.options.reduce((s, o) => s + o.votes.length, 0) ?? 0;
  const attending = post.event?.attendees.includes(userId) ?? false;

  const handleLike = async () => { const { data } = await api.post(`/posts/${post._id}/like`); onUpdate({ ...post, likes: data.likes }); };
  const handleBookmark = async () => { await api.post(`/posts/${post._id}/bookmark`); onUpdate({ ...post, bookmarks: bookmarked ? post.bookmarks.filter(id => id !== userId) : [...post.bookmarks, userId] }); };
  const handleVote = async (idx: number) => { if (myVote !== -1) return; const { data } = await api.post(`/posts/${post._id}/vote`, { optionIndex: idx }); onUpdate({ ...post, poll: { ...post.poll!, options: data.options } }); };
  const handleRsvp = async () => { const { data } = await api.post(`/posts/${post._id}/rsvp`); onUpdate({ ...post, event: { ...post.event!, attendees: data.attendees } }); };
  const handleComment = async () => {
    if (!commentText.trim() || submitting) return; setSubmitting(true);
    const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });
    onUpdate({ ...post, comments: [...post.comments, data] }); setCommentText(''); setSubmitting(false);
  };
  const handleDelete = async () => {
    setDeleting(true);
    await api.delete(`/posts/${post._id}`);
    onDelete(post._id); setShowDeleteConfirm(false);
  };

  const visIcon = { public: '🌐', friends: '👥', private: '🔒' };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <Avatar src={post.author.avatar} name={post.author.name} size={46} />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-[15px] dark:text-white">
                {post.author.name}
                {post.author.verified && <span className="w-4 h-4 rounded-full gradient-brand text-white text-[9px] flex items-center justify-center">✓</span>}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                {timeAgo(post.createdAt)}
                {post.editedAt && <span className="text-gray-300 dark:text-gray-600"> · edited</span>}
                {post.location && ` · 📍 ${post.location}`}
                <span className="ml-1" title={post.visibility}>{visIcon[post.visibility] || '🌐'}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 w-44 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <button onClick={() => { setShowShareModal(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all">
                      <Share2 className="w-4 h-4 text-brand-500" /> Share post
                    </button>
                    <button onClick={() => { handleBookmark(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all">
                      <Bookmark className={cn('w-4 h-4', bookmarked ? 'text-brand-500 fill-brand-500' : 'text-gray-400')} />
                      {bookmarked ? 'Unsave' : 'Save post'}
                    </button>
                    {isMe && <>
                      <button onClick={() => { setShowEdit(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all">
                        <Edit2 className="w-4 h-4 text-blue-500" /> Edit post
                      </button>
                      <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" /> Delete post
                      </button>
                    </>}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-3">
          {post.content && <p className="text-[15px] leading-relaxed mb-3 dark:text-gray-100">{post.content}</p>}

          {/* Shared post preview */}
          {post.type === 'share' && post.sharedFrom && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50 dark:bg-gray-800 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar src={(post.sharedFrom as any).author?.avatar} name={(post.sharedFrom as any).author?.name} size={28} />
                <span className="font-bold text-sm dark:text-white">{(post.sharedFrom as any).author?.name}</span>
                <span className="text-xs text-gray-400">{timeAgo((post.sharedFrom as any).createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{(post.sharedFrom as any).content}</p>
              {(post.sharedFrom as any).mediaUrl && (
                <img src={mediaUrl((post.sharedFrom as any).mediaUrl)} alt="" className="w-full max-h-48 object-cover rounded-xl" />
              )}
            </div>
          )}

          {post.type === 'image' && post.mediaUrl && (
            <div className="rounded-2xl overflow-hidden mb-3">
              <img src={mediaUrl(post.mediaUrl)} alt="" className="w-full max-h-[420px] object-cover" />
            </div>
          )}
          {post.type === 'video' && post.mediaUrl && (
            <div className="rounded-2xl overflow-hidden mb-3 bg-black">
              <video src={mediaUrl(post.mediaUrl)} controls className="w-full max-h-[360px]" />
            </div>
          )}
          {post.type === 'poll' && post.poll && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 mb-3">
              <p className="font-bold text-[15px] mb-4 dark:text-white">📊 {post.poll.question}</p>
              <div className="space-y-2.5">
                {post.poll.options.map((opt, i) => {
                  const pct = totalVotes ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                  const isMyVoteOpt = myVote === i;
                  return (
                    <div key={opt._id} onClick={() => handleVote(i)}
                      className={cn('relative rounded-xl overflow-hidden cursor-pointer', myVote !== -1 ? '' : 'hover:ring-2 hover:ring-brand-400')}>
                      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 text-sm font-semibold">
                        <span className={isMyVoteOpt ? 'text-brand-700 dark:text-brand-300' : 'dark:text-white'}>{isMyVoteOpt && '✓ '}{opt.text}</span>
                        {myVote !== -1 && <span className="text-brand-600 font-bold">{pct}%</span>}
                      </div>
                      <div className="absolute inset-0 rounded-xl" style={{ background: isMyVoteOpt ? '#c7d2fe' : '#e0e7ff' }} />
                      {myVote !== -1 && (
                        <motion.div className="absolute inset-0 rounded-xl"
                          style={{ background: isMyVoteOpt ? 'linear-gradient(135deg,#818cf8,#a78bfa)' : '#c7d2fe', originX: 0 }}
                          initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">{totalVotes} votes</p>
            </div>
          )}
          {post.type === 'event' && post.event && (
            <div className="border border-indigo-100 dark:border-indigo-900 rounded-2xl overflow-hidden mb-3">
              <div className="gradient-brand p-4">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{post.event.category}</div>
                <div className="text-white font-black text-lg">{post.event.title}</div>
              </div>
              <div className="p-4 space-y-1.5 dark:bg-gray-900">
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                  <span>📅 {post.event.date} at {post.event.time}</span>
                  <span>📍 {post.event.location}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm"><span className="font-bold text-brand-600">{post.event.attendees.length}</span><span className="text-gray-400"> / {post.event.maxAttendees} going</span></div>
                  <Button size="sm" variant={attending ? 'secondary' : 'primary'} onClick={handleRsvp}>{attending ? '✓ Going' : 'RSVP'}</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Counts */}
        <div className="px-5 pb-2 flex items-center justify-between text-xs text-gray-400">
          <span>{post.likes.length > 0 && `${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}</span>
          <div className="flex gap-2">
            {post.comments.length > 0 && <span>{post.comments.length} comments</span>}
            {post.shares > 0 && <span>{post.shares} shares</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-1">
          <div className="relative flex-1">
            <button onClick={handleLike} onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}
              className={cn('w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50 dark:hover:bg-gray-800', liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400')}>
              <Heart className={cn('w-[18px] h-[18px]', liked ? 'fill-red-500 text-red-500' : '')} /> Like
            </button>
            <AnimatePresence>
              {showReactions && (
                <motion.div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 px-3 py-2 flex gap-2 z-20"
                  initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                  onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {REACTIONS.map((r, i) => (
                    <motion.button key={r.label} className="text-2xl hover:scale-125 transition-transform"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => { handleLike(); setShowReactions(false); }}>{r.emoji}</motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <MessageCircle className="w-[18px] h-[18px]" /> Comment
          </button>
          <button onClick={() => setShowShareModal(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Share2 className="w-[18px] h-[18px]" /> Share
          </button>
          <button onClick={handleBookmark} className={cn('p-2 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800', bookmarked ? 'text-brand-600' : 'text-gray-400')}>
            <Bookmark className={cn('w-[18px] h-[18px]', bookmarked ? 'fill-brand-600' : '')} />
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div className="px-5 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-3"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {post.comments.map(c => (
                <div key={c._id} className="flex gap-2.5">
                  <Avatar src={c.user.avatar} name={c.user.name} size={32} />
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1">
                    <div className="font-bold text-xs text-brand-700 dark:text-brand-400 mb-0.5">{c.user.name}</div>
                    <div className="text-sm dark:text-gray-200">{c.text}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2.5 items-center pt-1">
                <Avatar src={useStore.getState().user?.avatar} name={useStore.getState().user?.name} size={32} />
                <div className="flex-1 flex gap-2">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()}
                    placeholder="Write a comment..." className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full px-4 py-2 text-sm outline-none focus:border-brand-400 transition-all" />
                  <button onClick={handleComment} disabled={!commentText.trim() || submitting}
                    className="w-9 h-9 gradient-brand rounded-full flex items-center justify-center text-white disabled:opacity-40">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '➤'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Modals */}
      {showEdit && <EditPostModal post={post} open onClose={() => setShowEdit(false)} onUpdated={onUpdate} />}
      {showShareModal && <ShareModal post={post} open onClose={() => setShowShareModal(false)} onShared={p => { onShare(p); setShowShareModal(false); }} />}

      {/* Delete confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}>
            <motion.div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-lg font-black dark:text-white mb-1">Delete post?</h3>
                <p className="text-gray-400 text-sm">This can't be undone. Your post will be permanently removed.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white transition-all disabled:opacity-60">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Feed ──────────────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('feed');
  const [showCreate, setShowCreate] = useState(false);
  const [showStoryCreate, setShowStoryCreate] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      if (tab === 'saved') {
        const { data } = await api.get('/posts/bookmarks');
        setBookmarks(data);
      } else {
        const endpoint = tab === 'trending' ? '/posts/explore' : '/posts/feed';
        const { data } = await api.get(endpoint);
        setPosts(data);
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(); }, [tab]);

  useEffect(() => {
    const s = getSocket();
    s.on('new_post', (post: Post) => setPosts(prev => [post, ...prev]));
    s.on('post_liked', ({ postId, likes }: any) => setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes } : p)));
    s.on('new_comment', ({ postId, comment }: any) => setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...p.comments, comment] } : p)));
    s.on('poll_voted', ({ postId, options }: any) => setPosts(prev => prev.map(p => p._id === postId && p.poll ? { ...p, poll: { ...p.poll, options } } : p)));
    s.on('event_rsvp', ({ postId, attendees }: any) => setPosts(prev => prev.map(p => p._id === postId && p.event ? { ...p, event: { ...p.event, attendees } } : p)));
    s.on('post_deleted', ({ postId }: any) => { setPosts(prev => prev.filter(p => p._id !== postId)); setBookmarks(prev => prev.filter(p => p._id !== postId)); });
    s.on('post_updated', (updated: Post) => { setPosts(prev => prev.map(p => p._id === updated._id ? updated : p)); setBookmarks(prev => prev.map(p => p._id === updated._id ? updated : p)); });
    return () => { ['new_post', 'post_liked', 'new_comment', 'poll_voted', 'event_rsvp', 'post_deleted', 'post_updated'].forEach(e => s.off(e)); };
  }, []);

  const activePosts = tab === 'saved' ? bookmarks : posts;

  const handleUpdate = (updated: Post) => {
    setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
    setBookmarks(prev => prev.map(p => p._id === updated._id ? updated : p));
  };
  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setBookmarks(prev => prev.filter(p => p._id !== id));
  };
  const handleShare = (p: Post) => setPosts(prev => [p, ...prev]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stories */}
      <Card className="p-4 mb-4 dark:bg-gray-900 dark:border-gray-800">
        <StoriesStripWrapper onOpenCreate={() => setShowStoryCreate(true)} />
      </Card>

      {/* Create post trigger */}
      <Card className="p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800" onClick={() => setShowCreate(true)}>
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={user?.avatar} name={user?.name} size={44} />
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-full px-5 py-2.5 text-sm text-gray-400 font-medium border border-gray-100 dark:border-gray-700">
            What's on your mind, {user?.name?.split(' ')[0]}?
          </div>
        </div>
        <div className="flex gap-1 pt-2 border-t border-gray-50 dark:border-gray-800">
          {[{ icon: Image, label: 'Photo', color: 'text-blue-500' }, { icon: Video, label: 'Video', color: 'text-green-500' }, { icon: BarChart3, label: 'Poll', color: 'text-purple-500' }, { icon: Calendar, label: 'Event', color: 'text-orange-500' }].map(({ icon: Icon, label, color }) => (
            <button key={label} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 transition-all">
              <Icon className={cn('w-4 h-4', color)} />{label}
            </button>
          ))}
        </div>
      </Card>

      <div className="mb-4">
        <TabBar tabs={[{ id: 'feed', label: 'For You' }, { id: 'trending', label: 'Trending' }, { id: 'saved', label: '🔖 Saved' }]} active={tab} onChange={setTab} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : activePosts.length === 0 ? (
        <Card className="text-center py-16 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-5xl mb-3">{tab === 'saved' ? '🔖' : '👋'}</div>
          <div className="font-bold text-lg mb-2 dark:text-white">{tab === 'saved' ? 'No saved posts' : 'Nothing here yet'}</div>
          <p className="text-gray-400 mb-5">{tab === 'saved' ? 'Bookmark posts to find them here' : 'Be the first to post something!'}</p>
          {tab !== 'saved' && <Button onClick={() => setShowCreate(true)}>Create Post</Button>}
        </Card>
      ) : (
        <div className="space-y-4">
          {activePosts.map(post => (
            <PostCard key={post._id} post={post} userId={user?._id || ''}
              onUpdate={handleUpdate} onDelete={handleDelete} onShare={handleShare} />
          ))}
        </div>
      )}

      <CreatePostModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={p => { setPosts(prev => [p, ...prev]); if (tab !== 'saved') loadPosts(); }} />
      <CreateStoryModal open={showStoryCreate} onClose={() => setShowStoryCreate(false)} />
    </div>
  );
}
