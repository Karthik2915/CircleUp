import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'video', 'poll', 'event', 'share'], default: 'text' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: '' },
  location: { type: String, default: '' },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares: { type: Number, default: 0 },
  visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  editedAt: { type: Date, default: null },
  poll: {
    question: String,
    options: [pollOptionSchema],
    endsAt: Date,
  },
  event: {
    title: String,
    description: String,
    date: String,
    time: String,
    location: String,
    maxAttendees: { type: Number, default: 20 },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    category: String,
  },
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);
