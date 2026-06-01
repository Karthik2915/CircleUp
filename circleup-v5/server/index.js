import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import hangoutRoutes from './routes/hangouts.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import storyRoutes from './routes/stories.js';
import { socketHandler } from './socket/index.js';
import { authenticateSocket } from './middleware/auth.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/hangouts', hangoutRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Manual re-seed endpoint (wipes and re-seeds)
app.post('/api/seed', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    // Force re-seed by dropping users first
    const User = (await import('./models/User.js')).default;
    await User.deleteMany({});
    await seedDatabase();
    res.json({ message: 'Re-seeded!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

io.use(authenticateSocket);
socketHandler(io);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/circleup')
  .then(async () => {
    console.log('✅ MongoDB connected');
    // seedDatabase() internally checks if data already exists — safe to always call
    await seedDatabase();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

export { io };
