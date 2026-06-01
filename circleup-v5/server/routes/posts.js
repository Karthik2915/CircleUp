import express from 'express';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { io } from '../index.js';

const router = express.Router();

const populatePost = (query) =>
  query
    .populate('author', 'name avatar verified')
    .populate('comments.user', 'name avatar')
    .populate('event.attendees', 'name avatar')
    .populate({ path: 'sharedFrom', populate: { path: 'author', select: 'name avatar verified' } });

// Get feed posts
router.get('/feed', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const me = await User.findById(req.user._id);
    const friendIds = [...me.friends, req.user._id];
    const posts = await populatePost(
      Post.find({ author: { $in: friendIds }, visibility: { $in: ['public', 'friends'] } })
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    );
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get public/trending posts
router.get('/explore', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = { visibility: 'public' };
    if (q) filter.content = { $regex: q, $options: 'i' };
    const posts = await populatePost(
      Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    );
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get user posts
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await populatePost(Post.find({ author: req.params.userId }).sort({ createdAt: -1 }));
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get bookmarked posts
router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const posts = await populatePost(Post.find({ bookmarks: req.user._id }).sort({ createdAt: -1 }));
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create post
router.post('/', authenticate, upload.single('media'), async (req, res) => {
  try {
    const { content, type, location, visibility, pollQuestion, pollOptions, pollEndsAt,
      eventTitle, eventDate, eventTime, eventLocation, eventMax, eventCategory, sharedFrom } = req.body;

    const postData = {
      author: req.user._id,
      content: content || '',
      type: type || 'text',
      location: location || '',
      visibility: visibility || 'public',
    };

    if (req.file) {
      postData.mediaUrl = `/uploads/${req.file.filename}`;
      postData.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    if (sharedFrom) {
      postData.sharedFrom = sharedFrom;
      postData.type = 'share';
      // increment share count on original
      await Post.findByIdAndUpdate(sharedFrom, { $inc: { shares: 1 } });
    }

    if (type === 'poll' && pollQuestion) {
      const options = JSON.parse(pollOptions || '[]');
      postData.poll = {
        question: pollQuestion,
        options: options.map(text => ({ text, votes: [] })),
        endsAt: pollEndsAt ? new Date(pollEndsAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    }

    if (type === 'event' && eventTitle) {
      postData.event = {
        title: eventTitle,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        maxAttendees: parseInt(eventMax) || 20,
        attendees: [req.user._id],
        category: eventCategory || 'Social',
      };
    }

    const post = await Post.create(postData);
    const populated = await populatePost(Post.findById(post._id));

    const me = await User.findById(req.user._id).populate('friends', 'socketId');
    me.friends.forEach(friend => {
      if (friend.socketId) io.to(friend.socketId).emit('new_post', populated);
    });

    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Edit post
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { content, location, visibility } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (content !== undefined) post.content = content;
    if (location !== undefined) post.location = location;
    if (visibility !== undefined) post.visibility = visibility;
    post.editedAt = new Date();
    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    io.emit('post_updated', populated);
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Like/unlike post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'socketId name');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else {
      post.likes.push(req.user._id);
      if (post.author._id.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          recipient: post.author._id, sender: req.user._id, type: 'like',
          message: `${req.user.name} liked your post`, refId: post._id, refModel: 'Post',
        });
        if (post.author.socketId) io.to(post.author.socketId).emit('notification', notif);
      }
    }
    await post.save();
    io.emit('post_liked', { postId: post._id, likes: post.likes, userId: req.user._id });
    res.json({ likes: post.likes, liked: !liked });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Comment on post
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id).populate('author', 'socketId name');
    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate('comments.user', 'name avatar');
    const newComment = post.comments[post.comments.length - 1];

    if (post.author._id.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: post.author._id, sender: req.user._id, type: 'comment',
        message: `${req.user.name} commented: "${text.slice(0, 50)}"`,
        refId: post._id, refModel: 'Post',
      });
      if (post.author.socketId) io.to(post.author.socketId).emit('notification', notif);
    }

    io.emit('new_comment', { postId: post._id, comment: newComment });
    res.json(newComment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Vote on poll
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post?.poll) return res.status(400).json({ message: 'Not a poll' });
    const alreadyVoted = post.poll.options.some(o => o.votes.includes(req.user._id));
    if (alreadyVoted) return res.status(400).json({ message: 'Already voted' });
    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();
    io.emit('poll_voted', { postId: post._id, options: post.poll.options });
    res.json({ options: post.poll.options });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// RSVP to event
router.post('/:id/rsvp', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post?.event) return res.status(400).json({ message: 'Not an event' });
    const attending = post.event.attendees.includes(req.user._id);
    if (attending) post.event.attendees.pull(req.user._id);
    else if (post.event.attendees.length < post.event.maxAttendees)
      post.event.attendees.push(req.user._id);
    else return res.status(400).json({ message: 'Event is full' });
    await post.save();
    io.emit('event_rsvp', { postId: post._id, attendees: post.event.attendees });
    res.json({ attendees: post.event.attendees, attending: !attending });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Bookmark
router.post('/:id/bookmark', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const bm = post.bookmarks.includes(req.user._id);
    if (bm) post.bookmarks.pull(req.user._id);
    else post.bookmarks.push(req.user._id);
    await post.save();
    res.json({ bookmarked: !bm });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    io.emit('post_deleted', { postId: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
