import express from 'express';
import { Message, Conversation } from '../models/Chat.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const convos = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } })
      .sort({ updatedAt: -1 });
    res.json(convos);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get or create DM conversation
router.post('/conversations/dm', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    let convo = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate('participants', 'name avatar isOnline');

    if (!convo) {
      convo = await Conversation.create({ participants: [req.user._id, userId], isGroup: false });
      await convo.populate('participants', 'name avatar isOnline');
    }
    res.json(convo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create group conversation
router.post('/conversations/group', authenticate, async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];
    const convo = await Conversation.create({
      participants: allParticipants,
      isGroup: true,
      groupName: name,
      admins: [req.user._id],
    });
    await convo.populate('participants', 'name avatar isOnline');
    res.json(convo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update group info (name, avatar)
router.patch('/conversations/:id/group', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, admins: req.user._id });
    if (!convo) return res.status(403).json({ message: 'Not an admin' });
    if (req.body.name) convo.groupName = req.body.name;
    if (req.file) convo.groupAvatar = `/uploads/${req.file.filename}`;
    await convo.save();
    await convo.populate('participants', 'name avatar isOnline');
    res.json(convo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add participants to group
router.post('/conversations/:id/participants', authenticate, async (req, res) => {
  try {
    const { userIds } = req.body;
    const convo = await Conversation.findOne({ _id: req.params.id, admins: req.user._id });
    if (!convo) return res.status(403).json({ message: 'Not an admin' });
    const newIds = userIds.filter((id) => !convo.participants.map(String).includes(id));
    convo.participants.push(...newIds);
    await convo.save();
    await convo.populate('participants', 'name avatar isOnline');
    res.json(convo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove participant / leave group
router.delete('/conversations/:id/participants/:userId', authenticate, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: 'Not found' });
    const isSelf = req.params.userId === req.user._id.toString();
    const isAdmin = convo.admins.map(String).includes(req.user._id.toString());
    if (!isSelf && !isAdmin) return res.status(403).json({ message: 'Forbidden' });
    convo.participants = convo.participants.filter(p => p.toString() !== req.params.userId);
    convo.admins = convo.admins.filter(a => a.toString() !== req.params.userId);
    await convo.save();
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get messages for conversation
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(messages.reverse());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Send message (REST fallback)
router.post('/conversations/:id/messages', authenticate, upload.single('media'), async (req, res) => {
  try {
    const { text, replyTo } = req.body;
    const msgData = {
      conversation: req.params.id,
      sender: req.user._id,
      text: text || '',
      readBy: [req.user._id],
      replyTo: replyTo || null,
    };
    if (req.file) {
      msgData.mediaUrl = `/uploads/${req.file.filename}`;
      msgData.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }
    const msg = await Message.create(msgData);
    await msg.populate('sender', 'name avatar');
    if (msg.replyTo) await msg.populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });
    await Conversation.findByIdAndUpdate(req.params.id, { lastMessage: msg._id });
    res.json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// React to message
router.post('/conversations/:id/messages/:msgId/react', authenticate, async (req, res) => {
  try {
    const { emoji } = req.body;
    const msg = await Message.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ message: 'Not found' });
    const existing = msg.reactions.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existing >= 0) {
      if (msg.reactions[existing].emoji === emoji) msg.reactions.splice(existing, 1);
      else msg.reactions[existing].emoji = emoji;
    } else {
      msg.reactions.push({ user: req.user._id, emoji });
    }
    await msg.save();
    await msg.populate('sender', 'name avatar');
    res.json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark conversation as read
router.post('/conversations/:id/read', authenticate, async (req, res) => {
  try {
    await Message.updateMany(
      { conversation: req.params.id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
