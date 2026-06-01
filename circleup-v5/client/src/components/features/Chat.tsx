import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Phone, Video, Info, Search, Plus, Check, CheckCheck,
  Image, Smile, Users, X, Crown, UserMinus, UserPlus, Edit2, ArrowLeft, CornerUpLeft
} from 'lucide-react';
import { api, getSocket, timeAgo, cn, mediaUrl } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Avatar, Card, Spinner, Badge, Modal } from '@/components/ui';

const EMOJIS = ['❤️','😂','😮','😢','😡','👍'];

interface Participant { _id: string; name: string; avatar: string; isOnline: boolean }
interface Conversation {
  _id: string;
  participants: Participant[];
  isGroup: boolean;
  groupName: string;
  groupAvatar: string;
  admins: string[];
  lastMessage: { text: string; sender: { name: string }; createdAt: string } | null;
  unreadCount?: number;
  updatedAt: string;
}
interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar: string };
  text: string;
  mediaUrl: string;
  mediaType: string;
  readBy: string[];
  reactions: { user: string; emoji: string }[];
  replyTo?: { _id: string; text: string; sender: { name: string } } | null;
  createdAt: string;
}

function convName(c: Conversation, myId: string) {
  if (c.isGroup) return c.groupName || 'Group Chat';
  return c.participants.find(p => p._id !== myId)?.name || 'Unknown';
}
function convAvatar(c: Conversation, myId: string) {
  return c.isGroup ? c.groupAvatar : (c.participants.find(p => p._id !== myId)?.avatar || '');
}
function convOnline(c: Conversation, myId: string, online: Set<string>) {
  if (c.isGroup) return c.participants.some(p => p._id !== myId && online.has(p._id));
  const other = c.participants.find(p => p._id !== myId);
  return other ? online.has(other._id) : false;
}

// ── New Group Modal ────────────────────────────────────────────────────────────
function NewGroupModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Conversation) => void }) {
  const { user } = useStore();
  const [friends, setFriends] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users/me/friends').then(({ data }) => setFriends(data));
  }, []);

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const create = async () => {
    if (!name.trim() || selected.length < 2) return;
    setLoading(true);
    try {
      const { data } = await api.post('/chat/conversations/group', { name: name.trim(), participantIds: selected });
      onCreate(data);
    } finally { setLoading(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Group Chat">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Group Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekend Crew"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Add Friends ({selected.length} selected, min 2)</label>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {friends.map(f => (
              <label key={f._id} className={cn('flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border',
                selected.includes(f._id) ? 'bg-brand-50 border-brand-300 dark:bg-brand-900/30' : 'border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800')}>
                <input type="checkbox" checked={selected.includes(f._id)} onChange={() => toggle(f._id)} className="hidden" />
                <Avatar src={f.avatar} name={f.name} size={36} />
                <span className="text-sm font-semibold dark:text-white">{f.name}</span>
                {selected.includes(f._id) && <Check className="w-4 h-4 text-brand-500 ml-auto" />}
              </label>
            ))}
          </div>
        </div>
        <button onClick={create} disabled={!name.trim() || selected.length < 2 || loading}
          className="w-full gradient-brand text-white font-bold py-3 rounded-xl disabled:opacity-40 transition-all hover:scale-[1.02]">
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </Modal>
  );
}

// ── Group Info Panel ───────────────────────────────────────────────────────────
function GroupInfoPanel({ convo, myId, onClose, onUpdate }: {
  convo: Conversation; myId: string; onClose: () => void; onUpdate: (c: Conversation) => void;
}) {
  const [friends, setFriends] = useState<Participant[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [toAdd, setToAdd] = useState<string[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(convo.groupName);
  const isAdmin = convo.admins.includes(myId);

  useEffect(() => {
    if (addMode) api.get('/users/me/friends').then(({ data }) => {
      setFriends(data.filter((f: Participant) => !convo.participants.find(p => p._id === f._id)));
    });
  }, [addMode]);

  const saveName = async () => {
    const { data } = await api.patch(`/chat/conversations/${convo._id}/group`, { name: newName });
    onUpdate(data); setEditingName(false);
  };

  const addMembers = async () => {
    const { data } = await api.post(`/chat/conversations/${convo._id}/participants`, { userIds: toAdd });
    onUpdate(data); setAddMode(false); setToAdd([]);
  };

  const removeMember = async (userId: string) => {
    await api.delete(`/chat/conversations/${convo._id}/participants/${userId}`);
    onUpdate({ ...convo, participants: convo.participants.filter(p => p._id !== userId) });
  };

  const leaveGroup = async () => {
    await api.delete(`/chat/conversations/${convo._id}/participants/${myId}`);
    onClose();
  };

  return (
    <motion.div className="w-72 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto flex-shrink-0"
      initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold dark:text-white">Group Info</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-col items-center p-5 gap-3 border-b border-gray-100 dark:border-gray-800">
        <Avatar src={convo.groupAvatar} name={convo.groupName} size={72} />
        {editingName
          ? <div className="flex gap-2 w-full">
              <input value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <button onClick={saveName} className="text-brand-600 font-bold text-sm px-3">Save</button>
            </div>
          : <div className="flex items-center gap-2">
              <span className="font-bold text-lg dark:text-white">{convo.groupName}</span>
              {isAdmin && <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-brand-500"><Edit2 className="w-4 h-4" /></button>}
            </div>
        }
        <span className="text-sm text-gray-400">{convo.participants.length} members</span>
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Members</span>
          {isAdmin && !addMode && (
            <button onClick={() => setAddMode(true)} className="flex items-center gap-1 text-xs text-brand-600 font-bold hover:text-brand-700">
              <UserPlus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>

        {addMode && (
          <div className="mb-3 space-y-2">
            {friends.map(f => (
              <label key={f._id} className={cn('flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all',
                toAdd.includes(f._id) ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/30' : 'border-gray-100 dark:border-gray-700')}>
                <input type="checkbox" checked={toAdd.includes(f._id)}
                  onChange={() => setToAdd(p => p.includes(f._id) ? p.filter(x => x !== f._id) : [...p, f._id])} className="hidden" />
                <Avatar src={f.avatar} name={f.name} size={28} />
                <span className="text-sm font-medium dark:text-white">{f.name}</span>
              </label>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={addMembers} disabled={!toAdd.length} className="flex-1 gradient-brand text-white text-xs font-bold py-2 rounded-lg disabled:opacity-40">Add</button>
              <button onClick={() => { setAddMode(false); setToAdd([]); }} className="flex-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold py-2 rounded-lg dark:text-white">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {convo.participants.map(p => (
            <div key={p._id} className="flex items-center gap-2.5 py-1.5">
              <Avatar src={p.avatar} name={p.name} size={34} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold dark:text-white truncate">{p.name}{p._id === myId ? ' (You)' : ''}</div>
                {convo.admins.includes(p._id) && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                    <Crown className="w-3 h-3" /> Admin
                  </div>
                )}
              </div>
              {isAdmin && p._id !== myId && (
                <button onClick={() => removeMember(p._id)} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg">
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={leaveGroup} className="w-full text-red-500 font-bold text-sm py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-red-200 dark:border-red-900">
          Leave Group
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Chat Component ────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user, onlineFriends } = useStore();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<Record<string, { name: string }[]>>({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [search, setSearch] = useState('');
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [emojiFor, setEmojiFor] = useState<string | null>(null);
  const [showMobile, setShowMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/chat/conversations').then(({ data }) => {
      setConvos(data); setLoadingConvos(false);
    });
  }, []);

  useEffect(() => {
    const s = getSocket();

    s.on('new_message', ({ conversationId, message }: any) => {
      if (activeConvo?._id === conversationId) {
        setMessages(prev => [...prev, message]);
        s.emit('mark_read', { conversationId });
      } else {
        setUnreadMap(prev => ({ ...prev, [conversationId]: (prev[conversationId] || 0) + 1 }));
      }
      setConvos(prev =>
        prev.map(c => c._id === conversationId ? { ...c, lastMessage: message, updatedAt: message.createdAt } : c)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    });

    s.on('message_preview', ({ conversationId }: any) => {
      setUnreadMap(prev => ({ ...prev, [conversationId]: (prev[conversationId] || 0) + 1 }));
    });

    s.on('typing', ({ conversationId, user: tu }: any) => {
      if (tu._id === user?._id) return;
      setTyping(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []).filter(u => u._id !== tu._id), tu],
      }));
    });

    s.on('stop_typing', ({ conversationId, userId: tid }: any) => {
      setTyping(prev => ({ ...prev, [conversationId]: (prev[conversationId] || []).filter(u => u._id !== tid) }));
    });

    s.on('messages_read', ({ conversationId, userId: rid }: any) => {
      if (activeConvo?._id === conversationId)
        setMessages(prev => prev.map(m => ({ ...m, readBy: m.readBy.includes(rid) ? m.readBy : [...m.readBy, rid] })));
    });

    return () => { ['new_message', 'message_preview', 'typing', 'stop_typing', 'messages_read'].forEach(e => s.off(e)); };
  }, [activeConvo, user?._id]);

  useEffect(() => {
    if (!activeConvo) return;
    setLoadingMsgs(true); setShowInfo(false);
    const s = getSocket();
    s.emit('join_conversation', activeConvo._id);
    s.emit('mark_read', { conversationId: activeConvo._id });
    setUnreadMap(prev => ({ ...prev, [activeConvo._id]: 0 }));
    api.get(`/chat/conversations/${activeConvo._id}/messages`).then(({ data }) => {
      setMessages(data); setLoadingMsgs(false);
    });
    return () => s.emit('leave_conversation', activeConvo._id);
  }, [activeConvo?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleTyping = () => {
    if (!activeConvo) return;
    const s = getSocket();
    s.emit('typing_start', { conversationId: activeConvo._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => s.emit('typing_stop', { conversationId: activeConvo._id }), 2000);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConvo) return;
    const s = getSocket();
    s.emit('send_message', {
      conversationId: activeConvo._id, text: input,
      replyTo: replyTo?._id || null,
    });
    s.emit('typing_stop', { conversationId: activeConvo._id });
    setInput(''); setReplyTo(null);
  };

  const reactToMessage = async (msgId: string, emoji: string) => {
    const { data } = await api.post(`/chat/conversations/${activeConvo?._id}/messages/${msgId}/react`, { emoji });
    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, reactions: data.reactions } : m));
    setEmojiFor(null);
  };

  const openDM = async (userId: string) => {
    const { data } = await api.post('/chat/conversations/dm', { userId });
    setActiveConvo(data);
    if (!convos.find(c => c._id === data._id)) setConvos(prev => [data, ...prev]);
    setShowMobile(true);
  };

  const filtered = convos.filter(c => convName(c, user?._id || '').toLowerCase().includes(search.toLowerCase()));
  const totalUnread = Object.values(unreadMap).reduce((s, n) => s + n, 0);
  const activeTypers = activeConvo ? (typing[activeConvo._id] || []) : [];

  return (
    <>
      <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-3xl border border-indigo-50 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* ── Conversation List ── */}
        <div className={cn('w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col flex-shrink-0',
          showMobile ? 'hidden md:flex' : 'flex')}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black dark:text-white">
                Messages {totalUnread > 0 && <Badge className="ml-2 gradient-brand text-white">{totalUnread}</Badge>}
              </h2>
              <button onClick={() => setShowNewGroup(true)}
                className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center text-white shadow hover:scale-105 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border border-gray-100 dark:border-gray-700 outline-none focus:border-brand-400 dark:text-white dark:placeholder-gray-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? <div className="flex justify-center py-10"><Spinner /></div> :
              filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-400 text-sm">No conversations yet.<br />Start one with a friend!</p>
                </div>
              ) :
              filtered.map(c => {
                const name = convName(c, user?._id || '');
                const avatar = convAvatar(c, user?._id || '');
                const isOnline = convOnline(c, user?._id || '', onlineFriends);
                const unread = unreadMap[c._id] || 0;
                const isActive = activeConvo?._id === c._id;
                const typers = typing[c._id] || [];
                return (
                  <div key={c._id}
                    onClick={() => { setActiveConvo(c); setShowMobile(true); }}
                    className={cn('flex items-center gap-3 px-4 py-3 cursor-pointer border-l-4 transition-all',
                      isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-brand-500' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800')}>
                    <div className="relative flex-shrink-0">
                      {c.isGroup
                        ? <div className="w-12 h-12 gradient-brand rounded-full flex items-center justify-center text-white font-bold shadow">
                            <Users className="w-5 h-5" />
                          </div>
                        : <Avatar src={avatar} name={name} size={48} online={isOnline} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn('text-sm font-bold truncate dark:text-white', unread > 0 ? 'text-gray-900' : 'text-gray-700')}>{name}</span>
                        {c.lastMessage && <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.updatedAt)}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn('text-xs truncate', unread > 0 ? 'text-gray-700 dark:text-gray-300 font-semibold' : 'text-gray-400')}>
                          {typers.length > 0
                            ? <span className="text-green-500 font-semibold italic">
                                {c.isGroup ? `${typers.map(t => t.name.split(' ')[0]).join(', ')} typing...` : 'typing...'}
                              </span>
                            : c.isGroup && c.lastMessage?.sender
                              ? `${c.lastMessage.sender.name.split(' ')[0]}: ${c.lastMessage.text || '📎 media'}`
                              : c.lastMessage?.text || 'No messages yet'
                          }
                        </span>
                        {unread > 0 && <span className="ml-2 gradient-brand text-white text-xs font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">{unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* ── Chat Area ── */}
        {!activeConvo ? (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center gap-3">
            <div className="text-6xl">💬</div>
            <h3 className="text-xl font-bold dark:text-white">Select a conversation</h3>
            <p className="text-gray-400 text-sm">Or create a group chat with the + button</p>
          </div>
        ) : (
          <div className={cn('flex-1 flex overflow-hidden', !showMobile && 'hidden md:flex')}>
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowMobile(false)} className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-1">
                    <ArrowLeft className="w-5 h-5 dark:text-white" />
                  </button>
                  {activeConvo.isGroup
                    ? <div className="w-10 h-10 gradient-brand rounded-full flex items-center justify-center text-white shadow">
                        <Users className="w-4 h-4" />
                      </div>
                    : <Avatar src={convAvatar(activeConvo, user?._id || '')} name={convName(activeConvo, user?._id || '')}
                        size={40} online={convOnline(activeConvo, user?._id || '', onlineFriends)} />
                  }
                  <div>
                    <div className="font-bold text-[15px] dark:text-white">{convName(activeConvo, user?._id || '')}</div>
                    <div className="text-xs text-gray-400">
                      {activeConvo.isGroup
                        ? `${activeConvo.participants.length} members`
                        : convOnline(activeConvo, user?._id || '', onlineFriends) ? '🟢 Active now' : 'Offline'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[Phone, Video].map((Icon, i) => (
                    <button key={i} className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl flex items-center justify-center text-brand-600 transition-all">
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                  {activeConvo.isGroup && (
                    <button onClick={() => setShowInfo(v => !v)}
                      className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-brand-600 transition-all',
                        showInfo ? 'gradient-brand text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100')}>
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" onClick={() => setEmojiFor(null)}>
                {loadingMsgs ? <div className="flex justify-center py-10"><Spinner /></div> :
                  messages.map((msg, idx) => {
                    const isMe = msg.sender._id === user?._id;
                    const showName = activeConvo.isGroup && !isMe && (idx === 0 || messages[idx - 1].sender._id !== msg.sender._id);
                    const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.sender._id !== msg.sender._id);
                    const isRead = msg.readBy.length > 1;
                    const grouped = idx > 0 && messages[idx - 1].sender._id === msg.sender._id;

                    return (
                      <motion.div key={msg._id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row', grouped ? 'mt-0.5' : 'mt-3')}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        {!isMe && (
                          <div style={{ width: 32, flexShrink: 0 }}>
                            {showAvatar && <Avatar src={msg.sender.avatar} name={msg.sender.name} size={32} />}
                          </div>
                        )}
                        <div className={cn('max-w-[70%] group relative', isMe ? 'items-end' : 'items-start')}>
                          {showName && <div className="text-[11px] font-bold text-brand-600 mb-1 ml-1">{msg.sender.name}</div>}

                          {/* Reply preview */}
                          {msg.replyTo && (
                            <div className={cn('text-[11px] px-3 py-1.5 rounded-xl mb-1 border-l-2 border-brand-400 bg-gray-100 dark:bg-gray-800', isMe ? 'bg-white/20 border-white/60' : '')}>
                              <span className="font-bold text-brand-500">{msg.replyTo.sender?.name}</span>
                              <div className="text-gray-500 dark:text-gray-400 truncate">{msg.replyTo.text}</div>
                            </div>
                          )}

                          {/* Media */}
                          {msg.mediaUrl && (
                            <div className="rounded-2xl overflow-hidden mb-1">
                              {msg.mediaType === 'video'
                                ? <video src={mediaUrl(msg.mediaUrl)} controls className="max-w-[220px] rounded-2xl" />
                                : <img src={mediaUrl(msg.mediaUrl)} alt="" className="max-w-[220px] rounded-2xl object-cover" />}
                            </div>
                          )}

                          {/* Text bubble */}
                          {msg.text && (
                            <div className={cn('px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium relative',
                              isMe ? 'gradient-brand text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm')}>
                              {msg.text}
                            </div>
                          )}

                          {/* Reactions */}
                          {msg.reactions?.length > 0 && (
                            <div className={cn('flex flex-wrap gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
                              {Object.entries(
                                msg.reactions.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.emoji]: (acc[r.emoji] || 0) + 1 }), {})
                              ).map(([emoji, count]) => (
                                <span key={emoji} className="text-xs bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-1.5 py-0.5 shadow-sm cursor-pointer"
                                  onClick={() => reactToMessage(msg._id, emoji)}>
                                  {emoji} {count > 1 ? count : ''}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Meta */}
                          <div className={cn('flex items-center gap-1 mt-0.5', isMe ? 'justify-end' : 'justify-start')}>
                            <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                            {isMe && (isRead ? <CheckCheck className="w-3 h-3 text-brand-500" /> : <Check className="w-3 h-3 text-gray-400" />)}
                          </div>

                          {/* Hover actions */}
                          <div className={cn('absolute top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-all', isMe ? 'right-full mr-2' : 'left-full ml-2')}>
                            <button onClick={e => { e.stopPropagation(); setEmojiFor(emojiFor === msg._id ? null : msg._id); }}
                              className="w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-all">
                              <Smile className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button onClick={() => setReplyTo(msg)}
                              className="w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-all">
                              <CornerUpLeft className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </div>

                          {/* Emoji picker */}
                          <AnimatePresence>
                            {emojiFor === msg._id && (
                              <motion.div
                                className={cn('absolute z-20 flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2 shadow-xl', isMe ? 'right-0 bottom-full mb-2' : 'left-0 bottom-full mb-2')}
                                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                                {EMOJIS.map(e => (
                                  <button key={e} onClick={() => reactToMessage(msg._id, e)}
                                    className="text-lg hover:scale-125 transition-transform">{e}</button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })
                }

                {/* Typing indicator */}
                <AnimatePresence>
                  {activeTypers.length > 0 && (
                    <motion.div className="flex gap-2 mt-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 flex gap-1 items-center">
                        {activeConvo.isGroup && <span className="text-xs text-gray-500 mr-1">{activeTypers.map(t => t.name.split(' ')[0]).join(', ')}</span>}
                        {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Reply preview bar */}
              <AnimatePresence>
                {replyTo && (
                  <motion.div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="flex-1 border-l-2 border-brand-500 pl-3">
                      <div className="text-xs font-bold text-brand-600">{replyTo.sender.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyTo.text}</div>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all">
                  <Image className="w-5 h-5" />
                </button>
                <input type="file" accept="image/*,video/*" className="hidden" ref={fileRef}
                  onChange={async e => {
                    const file = e.target.files?.[0]; if (!file || !activeConvo) return;
                    const fd = new FormData(); fd.append('media', file);
                    if (replyTo) fd.append('replyTo', replyTo._id);
                    const { data } = await api.post(`/chat/conversations/${activeConvo._id}/messages`, fd);
                    setMessages(prev => [...prev, data]);
                    setReplyTo(null);
                    e.target.value = '';
                  }} />
                <input value={input}
                  onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={replyTo ? 'Reply...' : 'Message...'}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 transition-all dark:text-white dark:placeholder-gray-500" />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center text-white shadow disabled:opacity-40 hover:scale-105 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Group info panel */}
            <AnimatePresence>
              {showInfo && activeConvo.isGroup && (
                <GroupInfoPanel
                  convo={activeConvo} myId={user?._id || ''}
                  onClose={() => setShowInfo(false)}
                  onUpdate={updated => {
                    setActiveConvo(updated);
                    setConvos(prev => prev.map(c => c._id === updated._id ? updated : c));
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onCreate={newConvo => {
            setConvos(prev => [newConvo, ...prev]);
            setActiveConvo(newConvo);
            setShowNewGroup(false);
            setShowMobile(true);
          }}
        />
      )}
    </>
  );
}
