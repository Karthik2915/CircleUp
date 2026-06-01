import mongoose from 'mongoose';

const hangoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '☕ Social' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  maxAttendees: { type: Number, default: 20 },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String, default: '' },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Hangout', hangoutSchema);
