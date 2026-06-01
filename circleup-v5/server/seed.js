import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Post from './models/Post.js';
import Hangout from './models/Hangout.js';
import Story from './models/Story.js';

const DEMO_USERS = [
  { name: 'Priya Sharma',  email: 'priya@demo.com',  password: 'demo1234', bio: 'Photographer & travel enthusiast 📸 | Mumbai 🇮🇳',       location: 'Mumbai, India',    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332f1f8?w=200&h=200&fit=crop&crop=face', verified: true },
  { name: 'Arjun Mehta',   email: 'arjun@demo.com',  password: 'demo1234', bio: 'Full-stack dev by day, chef by night 👨‍💻🍳',               location: 'Delhi, India',     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', verified: false },
  { name: 'Sofia Costa',   email: 'sofia@demo.com',  password: 'demo1234', bio: 'Designer & coffee addict ☕ | Lisbon 🇵🇹',                  location: 'Lisbon, Portugal', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', verified: true },
  { name: 'James Liu',     email: 'james@demo.com',  password: 'demo1234', bio: 'Street photographer | Toronto 🇨🇦 | Canon shooter',        location: 'Toronto, Canada',  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', verified: false },
  { name: 'Aisha Patel',   email: 'aisha@demo.com',  password: 'demo1234', bio: 'Bookworm & yoga teacher 🧘‍♀️📚 | London 🇬🇧',               location: 'London, UK',       avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face', verified: true },
  { name: 'Ethan Brooks',  email: 'ethan@demo.com',  password: 'demo1234', bio: 'Musician & coffee explorer 🎸 | NYC 🗽',                   location: 'New York, USA',    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', verified: false },
];

const DEMO_POSTS = [
  { content: 'Golden hour at Marine Drive — nothing beats this 🌅✨ #Mumbai #Sunset', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', location: 'Marine Drive, Mumbai' },
  { content: 'Just finished building a real-time chat feature! Socket.io is incredible 🔌⚡', type: 'text', location: 'Delhi, India' },
  { content: 'My favourite corner of Lisbon ☕🏛️ Old town mornings hit different', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop', location: 'Alfama, Lisbon' },
  { content: 'Weekend photography walk — caught this gem near downtown 📸', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=500&fit=crop', location: 'Downtown Toronto' },
  { content: 'Book recommendation time! Reading "The Midnight Library" and it is absolutely stunning 📚✨', type: 'text', location: 'London, UK' },
  { content: "New track dropping soon 🎸🎶 Here's a peek at the studio session", type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop', location: 'Brooklyn, NYC' },
  {
    content: "What's your favourite way to spend a Sunday? 🗳️",
    type: 'poll',
    poll: {
      question: 'Best way to spend Sunday?',
      options: [
        { text: '🥞 Brunch + Netflix', votes: [] },
        { text: '🏔️ Outdoor hike',     votes: [] },
        { text: '📚 Read a good book', votes: [] },
        { text: '☕ Work from a café', votes: [] },
      ],
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    content: 'Photography walk this Saturday — all skill levels welcome! 📸 Limited spots.',
    type: 'event',
    event: {
      title: 'Urban Photography Walk',
      date: '2026-04-05',
      time: '10:00',
      location: 'Downtown Core, Toronto',
      maxAttendees: 20,
      attendees: [],
      category: '📸 Photography',
    },
  },
  { content: "Sunset yoga on the rooftop tonight 🧘‍♀️🌇 Join me if you're in London!", type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop', location: 'Shoreditch, London' },
  { content: 'Homemade pasta night turned out incredible 🍝 Recipe drop incoming...', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1673548917416-c9e9ddcfbf5e?w=800&h=500&fit=crop', location: 'Delhi, India' },
];

const DEMO_HANGOUTS = [
  { title: 'Weekend Hiking Trip',       description: "Beautiful trail with scenic valley views. All fitness levels welcome! We'll stop for a picnic halfway.", category: '🏔️ Outdoor',       date: '2026-04-12', time: '09:00', location: 'Blue Ridge Trail, Shimla',        maxAttendees: 12, image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop',  tags: ['Hiking','Nature','Fitness'] },
  { title: 'Coffee & Code Sunday',      description: 'Casual co-working session at our favourite café. Bring your laptop, projects, and curiosity!',            category: '☕ Social',        date: '2026-04-06', time: '14:00', location: 'Third Wave Coffee, Bangalore',    maxAttendees: 10, image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=400&fit=crop',  tags: ['Tech','Coffee','Networking'] },
  { title: 'Sunset Beach Volleyball',   description: 'Friendly match at Juhu Beach. All levels welcome — just come for fun, sun, and good vibes!',              category: '🏖️ Sports',       date: '2026-04-19', time: '17:00', location: 'Juhu Beach, Mumbai',             maxAttendees: 16, image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',  tags: ['Sports','Beach','Fun'] },
  { title: 'Jazz Night at The Blue Note', description: 'Intimate jazz evening with live performances. Dress smart-casual. Bar & dinner available.',             category: '🎵 Music',         date: '2026-04-10', time: '20:00', location: 'The Blue Note, New York',         maxAttendees: 30, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop', tags: ['Jazz','Music','Nightlife'] },
];

const DEMO_STORIES = [
  { mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=700&fit=crop', caption: 'Golden hour vibes 🌅',  authorIdx: 0 },
  { mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=700&fit=crop', caption: 'Morning in Lisbon ☕',     authorIdx: 2 },
  { mediaUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=700&fit=crop', caption: 'City streets 📸',        authorIdx: 3 },
  { mediaUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=700&fit=crop', caption: 'Sunday yoga 🧘‍♀️',         authorIdx: 4 },
  { mediaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop', caption: 'Studio session 🎸',      authorIdx: 5 },
];

export async function seedDatabase() {
  // Only seed if no users exist
  const existing = await User.countDocuments();
  if (existing > 0) return null;

  console.log('🌱 Seeding demo data...');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Hangout.deleteMany({}), Story.deleteMany({})]);

  // Create users (passwords hashed by pre-save hook)
  const users = await User.create(DEMO_USERS);

  // Make everyone friends with each other
  for (const user of users) {
    user.friends = users.filter(u => u._id.toString() !== user._id.toString()).map(u => u._id);
    await user.save();
  }

  // Create posts
  for (let i = 0; i < DEMO_POSTS.length; i++) {
    const postData = DEMO_POSTS[i];
    const author = users[i % users.length];
    const postDoc = await Post.create({ ...postData, author: author._id });

    // Add some likes from other users
    const likers = users.filter(u => u._id.toString() !== author._id.toString()).slice(0, Math.floor(Math.random() * 4) + 1);
    postDoc.likes = likers.map(u => u._id);

    // Add poll votes
    if (postData.type === 'poll' && postDoc.poll) {
      users.forEach((u, idx) => {
        postDoc.poll.options[idx % postDoc.poll.options.length].votes.push(u._id);
      });
    }
    // Add event attendees
    if (postData.type === 'event' && postDoc.event) {
      postDoc.event.attendees = users.slice(0, 3).map(u => u._id);
    }
    await postDoc.save();
  }

  // Create hangouts
  for (let i = 0; i < DEMO_HANGOUTS.length; i++) {
    const organizer = users[i % users.length];
    const attendees = users.slice(0, Math.floor(Math.random() * 4) + 2).map(u => u._id);
    await Hangout.create({ ...DEMO_HANGOUTS[i], organizer: organizer._id, attendees });
  }

  // Create stories
  for (const s of DEMO_STORIES) {
    await Story.create({
      author: users[s.authorIdx]._id,
      mediaUrl: s.mediaUrl,
      mediaType: 'image',
      caption: s.caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    });
  }

  console.log(`✅ Seeded ${users.length} users, ${DEMO_POSTS.length} posts, ${DEMO_HANGOUTS.length} hangouts, ${DEMO_STORIES.length} stories`);
  return { users: users.length, posts: DEMO_POSTS.length };
}
