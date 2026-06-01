import express from 'express';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { io } from '../index.js';

const router = express.Router();

// Get stories from friends + self
router.get('/', authenticate, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const authorIds = [req.user._id, ...me.friends];
    const now = new Date();
    const stories = await Story.find({
      author: { $in: authorIds },
      expiresAt: { $gt: now },
    })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Group by author
    const grouped = {};
    stories.forEach(s => {
      const aid = s.author._id.toString();
      if (!grouped[aid]) grouped[aid] = { author: s.author, stories: [], hasUnviewed: false };
      grouped[aid].stories.push(s);
      if (!s.viewers.includes(req.user._id)) grouped[aid].hasUnviewed = true;
    });

    res.json(Object.values(grouped));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create story
router.post('/', authenticate, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Media required' });
    const story = await Story.create({
      author: req.user._id,
      mediaUrl: `/uploads/${req.file.filename}`,
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      caption: req.body.caption || '',
    });
    await story.populate('author', 'name avatar');

    // Broadcast to friends
    const me = await User.findById(req.user._id).populate('friends', 'socketId');
    me.friends.forEach(f => { if (f.socketId) io.to(f.socketId).emit('new_story', story); });

    res.status(201).json(story);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// View story (mark as seen)
router.post('/:id/view', authenticate, async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete own story
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    if (story.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await story.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
