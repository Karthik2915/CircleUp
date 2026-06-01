import express from 'express';
import Hangout from '../models/Hangout.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { io } from '../index.js';

const router = express.Router();

// Get all hangouts
router.get('/', authenticate, async (req, res) => {
  try {
    const hangouts = await Hangout.find({ isPublic: true })
      .populate('organizer', 'name avatar')
      .populate('attendees', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(hangouts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create hangout
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, date, time, location, maxAttendees, tags } = req.body;
    const hangout = await Hangout.create({
      title, description, category, date, time, location,
      maxAttendees: parseInt(maxAttendees) || 20,
      organizer: req.user._id,
      attendees: [req.user._id],
      image: req.file ? `/uploads/${req.file.filename}` : '',
      tags: tags ? JSON.parse(tags) : [],
    });
    await hangout.populate('organizer', 'name avatar');
    await hangout.populate('attendees', 'name avatar');

    io.emit('new_hangout', hangout);
    res.status(201).json(hangout);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Join/leave hangout
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const hangout = await Hangout.findById(req.params.id).populate('organizer', 'socketId name');
    if (!hangout) return res.status(404).json({ message: 'Hangout not found' });

    const joined = hangout.attendees.includes(req.user._id);
    if (joined) hangout.attendees.pull(req.user._id);
    else {
      if (hangout.attendees.length >= hangout.maxAttendees)
        return res.status(400).json({ message: 'Hangout is full' });
      hangout.attendees.push(req.user._id);

      if (hangout.organizer._id.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          recipient: hangout.organizer._id,
          sender: req.user._id,
          type: 'hangout_invite',
          message: `${req.user.name} joined your hangout "${hangout.title}"`,
        });
        if (hangout.organizer.socketId) {
          io.to(hangout.organizer.socketId).emit('notification', notif);
        }
      }
    }
    await hangout.save();
    await hangout.populate('attendees', 'name avatar');
    io.emit('hangout_updated', hangout);
    res.json({ joined: !joined, attendees: hangout.attendees });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete hangout
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const hangout = await Hangout.findById(req.params.id);
    if (!hangout) return res.status(404).json({ message: 'Not found' });
    if (hangout.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await hangout.deleteOne();
    res.json({ message: 'Hangout deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
