import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Camera, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { api, mediaUrl, timeAgo } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Spinner } from '@/components/ui';

interface Story {
  _id: string;
  author: { _id: string; name: string; avatar: string };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  viewers: string[];
  createdAt: string;
  expiresAt: string;
}

interface StoryGroup {
  author: { _id: string; name: string; avatar: string };
  stories: Story[];
  hasUnviewed: boolean;
}

// ── Story Viewer ──────────────────────────────────────────────────
function StoryViewer({ groups, startGroupIdx, onClose }: { groups: StoryGroup[]; startGroupIdx: number; onClose: () => void }) {
  const { user } = useStore();
  const [groupIdx, setGroupIdx] = useState(startGroupIdx);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const DURATION = story?.mediaType === 'video' ? 15000 : 5000;

  useEffect(() => {
    if (!story) return;
    // Mark as viewed
    api.post(`/stories/${story._id}/view`).catch(() => {});

    setProgress(0);
    clearInterval(intervalRef.current);
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(intervalRef.current);
          goNext();
          return 0;
        }
        return p + (100 / (DURATION / 100));
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [storyIdx, groupIdx, paused]);

  const goNext = () => {
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(i => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(g => g + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIdx > 0) setStoryIdx(i => i - 1);
    else if (groupIdx > 0) { setGroupIdx(g => g - 1); setStoryIdx(0); }
  };

  if (!story) return null;

  return (
    <motion.div className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Prev/Next group arrows */}
      {groupIdx > 0 && (
        <button onClick={() => { setGroupIdx(g => g - 1); setStoryIdx(0); }}
          className="absolute left-4 z-20 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {groupIdx < groups.length - 1 && (
        <button onClick={() => { setGroupIdx(g => g + 1); setStoryIdx(0); }}
          className="absolute right-4 z-20 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story container */}
      <div className="relative w-full max-w-sm h-full max-h-[90vh] mx-auto" onClick={e => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
              <motion.div className="h-full bg-white rounded-full"
                animate={{ width: i < storyIdx ? '100%' : i === storyIdx ? `${progress}%` : '0%' }}
                transition={{ duration: 0 }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Avatar src={group.author.avatar} name={group.author.name} size={36} />
            <div>
              <div className="text-white font-bold text-sm">{group.author.name}</div>
              <div className="text-white/70 text-xs">{timeAgo(story.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPaused(p => !p)} className="text-white/80 hover:text-white">
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Media */}
        <AnimatePresence mode="wait">
          <motion.div key={story._id} className="w-full h-full"
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {story.mediaType === 'video' ? (
              <video ref={videoRef} src={mediaUrl(story.mediaUrl)} className="w-full h-full object-cover rounded-2xl"
                autoPlay muted={false} playsInline />
            ) : (
              <img src={mediaUrl(story.mediaUrl)} alt="" className="w-full h-full object-cover rounded-2xl" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-6 left-4 right-4 z-20">
            <p className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">{story.caption}</p>
          </div>
        )}

        {/* Viewer count */}
        <div className="absolute bottom-16 left-4 z-20 flex items-center gap-1 text-white/70 text-xs">
          👁️ {story.viewers.length} views
        </div>

        {/* Tap zones */}
        <button className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={goPrev} />
        <button className="absolute right-0 top-0 bottom-0 w-1/3 z-10" onClick={goNext} />
      </div>
    </motion.div>
  );
}

// ── Create Story Modal ────────────────────────────────────────────
function CreateStoryModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setFileType(f.type.startsWith('video') ? 'video' : 'image');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('media', file);
    fd.append('caption', caption);
    await api.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setLoading(false);
    setPreview(''); setFile(null); setCaption('');
    onCreated();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}>
        <motion.div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden"
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-black text-lg dark:text-white">Add Story</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="p-5">
            {!preview ? (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-16 text-center cursor-pointer hover:border-brand-500 hover:bg-indigo-50 transition-all">
                <Camera className="w-12 h-12 text-brand-300 mx-auto mb-3" />
                <p className="font-bold text-brand-600">Upload photo or video</p>
                <p className="text-xs text-gray-400 mt-1">Disappears in 24 hours</p>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-black">
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
                <button onClick={submit} disabled={loading}
                  className="w-full gradient-brand text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Uploading...</> : '📤 Share Story'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Stories Strip (exported for Feed) ────────────────────────────
export default function StoriesStrip({ onOpenCreate, onAddStory }: { onOpenCreate?: () => void; onAddStory?: () => void }) {
  const { user } = useStore();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/stories');
      setGroups(data);
    } catch { setGroups([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 px-1">
        {/* Add Story */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
          onClick={() => { setShowCreate(true); onOpenCreate?.(); onAddStory?.(); }}>
          <div className="relative w-16 h-16">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              {user?.avatar
                ? <img src={mediaUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold text-xl">{user?.name?.[0]}</div>}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 gradient-brand rounded-full border-2 border-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Your Story</span>
        </div>

        {/* Friend stories */}
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="w-10 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))
        ) : groups.map((g, i) => (
          <div key={g.author._id} className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
            onClick={() => setViewerIdx(i)}>
            <div className={`w-16 h-16 rounded-full p-[2.5px] ${g.hasUnviewed ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-gray-300'}`}>
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-gray-900">
                <img src={g.author.avatar} alt={g.author.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 max-w-[64px] truncate text-center">{g.author.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {viewerIdx !== null && (
          <StoryViewer groups={groups} startGroupIdx={viewerIdx} onClose={() => setViewerIdx(null)} />
        )}
      </AnimatePresence>

      <CreateStoryModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </>
  );
}
