import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { io } from '../index.js';

const router = express.Router();

// ── All /me routes MUST come before /:id ──────────────────────────

// Get own profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('friends', 'name avatar isOnline');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update profile
router.patch('/me/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, location, website } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, bio, location, website }, { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upload avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: url }, { new: true }).select('-password');
    res.json({ avatar: url, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upload cover photo
router.post('/me/cover', authenticate, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { coverPhoto: url }, { new: true }).select('-password');
    res.json({ coverPhoto: url, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get friends list
router.get('/me/friends', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name avatar isOnline lastSeen bio location');
    res.json(user.friends);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get incoming friend requests
router.get('/me/friend-requests', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests.from', 'name avatar bio');
    res.json(user.friendRequests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Accept / decline a friend request
router.post('/me/friend-requests/:requesterId/respond', authenticate, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    const user = await User.findById(req.user._id);
    user.friendRequests = user.friendRequests.filter(
      r => r.from.toString() !== req.params.requesterId
    );
    if (action === 'accept') {
      user.friends.push(req.params.requesterId);
      await User.findByIdAndUpdate(req.params.requesterId, {
        $addToSet: { friends: req.user._id },
        $pull: { sentRequests: req.user._id },
      });
      await Notification.create({
        recipient: req.params.requesterId,
        sender: req.user._id,
        type: 'friend_accept',
        message: `${req.user.name} accepted your friend request`,
      });
    }
    await user.save();
    res.json({ message: `Friend request ${action}ed` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Suggested friends
router.get('/me/suggestions', authenticate, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const excluded = [req.user._id, ...me.friends, ...(me.sentRequests || [])];
    const suggestions = await User.find({ _id: { $nin: excluded } })
      .select('name avatar bio location')
      .limit(10);
    res.json(suggestions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Search users
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json([]);
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('-password').limit(20);
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Send friend request
router.post('/:id/friend-request', authenticate, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.friendRequests.some(r => r.from.toString() === req.user._id.toString()))
      return res.status(400).json({ message: 'Request already sent' });
    if (target.friends.includes(req.user._id))
      return res.status(400).json({ message: 'Already friends' });

    target.friendRequests.push({ from: req.user._id });
    await target.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { sentRequests: target._id } });

    const notif = await Notification.create({
      recipient: target._id,
      sender: req.user._id,
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request`,
    });
    if (target.socketId) io.to(target.socketId).emit('notification', notif);
    res.json({ message: 'Friend request sent' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get any user profile — MUST be last to not shadow /me/* routes
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'name avatar isOnline');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
