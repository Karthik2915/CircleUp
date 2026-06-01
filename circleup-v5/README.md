# CircleUp v5 — Full-Stack Social App

## 🚀 Quick Start

### 1. Backend
```bash
cd server
cp .env.example .env   # Edit MONGODB_URI + JWT_SECRET
npm install
npm run dev            # Runs on http://localhost:5000
```
On first boot with an empty database, demo data is **auto-seeded** (6 users, 10 posts, 4 hangouts).

### 2. Frontend
```bash
cd client
cp .env.example .env   # Optional: add VITE_GOOGLE_MAPS_KEY
npm install
npm run dev            # Runs on http://localhost:5173
```

---

## 🔑 Demo Accounts (auto-seeded)
| Name | Email | Password |
|------|-------|----------|
| Priya Sharma | priya@demo.com | demo1234 |
| Arjun Mehta | arjun@demo.com | demo1234 |
| Sofia Costa | sofia@demo.com | demo1234 |
| James Liu | james@demo.com | demo1234 |
| Aisha Patel | aisha@demo.com | demo1234 |
| Ethan Brooks | ethan@demo.com | demo1234 |

All users are **friends with each other** so the feed is immediately populated.

---

## 🗺️ Google Maps Setup (for real map in Explore)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Maps JavaScript API** + **Places API**
3. Create an API Key
4. Add to `client/.env`:
   ```
   VITE_GOOGLE_MAPS_KEY=AIzaSy...your_key
   ```
The app works without the key — it shows a visual placeholder instead.

---

## ✨ Features

### Stories
- 24-hour expiring stories (image or video)
- Real-time story ring (gradient = unviewed, gray = seen)
- Story viewer with progress bar, tap-to-advance, pause/play
- View counter

### Search
- Search real users by name/email
- Search posts by content
- Send friend requests directly from results
- Recent search history (localStorage)
- Suggested people (friend-of-friend recommendations)

### Feed
- Real posts from seeded users
- Photo & video uploads (real file storage in `server/uploads/`)
- Polls with animated vote bars
- Events with RSVP
- Real-time reactions, comments, likes via Socket.io

### Explore (Google Maps)
- Live Google Maps with your real GPS location
- Nearby places from Google Places API (cafés, restaurants, bars, etc.)
- Category filters, check-in, directions link
- Friends nearby tab with real users from DB

### Hangouts
- Real hangouts from DB
- Create / Join / Leave
- Real-time updates via Socket.io
- Category cover images

### Chat
- Real-time DMs via Socket.io
- Typing indicators, read receipts
- Media sharing

---

## 🏗️ Tech Stack
**Frontend:** React 18 + TypeScript, Vite, Framer Motion, Tailwind CSS, Radix UI, Zustand, Socket.io-client  
**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.io, JWT, Multer, bcryptjs
