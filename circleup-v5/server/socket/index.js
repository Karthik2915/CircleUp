import User from '../models/User.js';
import { Message, Conversation } from '../models/Chat.js';
import Notification from '../models/Notification.js';

const onlineUsers = new Map(); // userId -> socketId

export const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🔌 ${user.name} connected (${socket.id})`);

    onlineUsers.set(user._id.toString(), socket.id);
    await User.findByIdAndUpdate(user._id, { isOnline: true, socketId: socket.id });

    // Broadcast to friends
    const me = await User.findById(user._id).populate('friends', '_id');
    me.friends.forEach(friend => {
      const fSocket = onlineUsers.get(friend._id.toString());
      if (fSocket) io.to(fSocket).emit('friend_online', { userId: user._id, isOnline: true });
    });

    // Send online friends list to newly connected user
    const onlineFriends = me.friends
      .filter(f => onlineUsers.has(f._id.toString()))
      .map(f => f._id.toString());
    socket.emit('online_friends', onlineFriends);

    // ── CHAT ──────────────────────────────────────────────────────
    socket.on('join_conversation', (conversationId) => socket.join(`conv_${conversationId}`));
    socket.on('leave_conversation', (conversationId) => socket.leave(`conv_${conversationId}`));

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text, mediaUrl, mediaType, replyTo } = data;

        const convo = await Conversation.findOne({
          _id: conversationId,
          participants: user._id,
        }).populate('participants', '_id socketId name');

        if (!convo) return socket.emit('error', { message: 'Conversation not found' });

        const msg = await Message.create({
          conversation: conversationId,
          sender: user._id,
          text: text || '',
          mediaUrl: mediaUrl || '',
          mediaType: mediaType || '',
          readBy: [user._id],
          replyTo: replyTo || null,
        });

        await msg.populate('sender', 'name avatar');
        if (replyTo) {
          await msg.populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });
        }
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: msg._id });

        io.to(`conv_${conversationId}`).emit('new_message', { conversationId, message: msg });

        // Notify participants not in the room
        convo.participants.forEach(async (p) => {
          if (p._id.toString() === user._id.toString()) return;
          const pSocket = onlineUsers.get(p._id.toString());
          if (!pSocket) {
            await Notification.create({
              recipient: p._id,
              sender: user._id,
              type: 'mention',
              message: `${user.name}: ${(text || '').slice(0, 60)}`,
            });
          } else {
            io.to(pSocket).emit('message_preview', {
              conversationId,
              from: { _id: user._id, name: user.name, avatar: user.avatar },
              text: text || '',
            });
          }
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing — send userId AND name so client can filter/display both
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        conversationId,
        user: { _id: user._id.toString(), name: user.name },
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('stop_typing', {
        conversationId,
        userId: user._id.toString(), // string for easy comparison
        userName: user.name,
      });
    });

    // Read receipts
    socket.on('mark_read', async ({ conversationId }) => {
      await Message.updateMany(
        { conversation: conversationId, readBy: { $ne: user._id } },
        { $addToSet: { readBy: user._id } }
      );
      socket.to(`conv_${conversationId}`).emit('messages_read', {
        conversationId,
        userId: user._id.toString(),
      });
    });

    // Posts
    socket.on('join_post', (postId) => socket.join(`post_${postId}`));
    socket.on('leave_post', (postId) => socket.leave(`post_${postId}`));

    // ── DISCONNECT ────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 ${user.name} disconnected`);
      onlineUsers.delete(user._id.toString());
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date(), socketId: '' });

      const freshUser = await User.findById(user._id).populate('friends', '_id');
      freshUser?.friends.forEach(friend => {
        const fSocket = onlineUsers.get(friend._id.toString());
        if (fSocket) io.to(fSocket).emit('friend_online', { userId: user._id, isOnline: false });
      });
    });
  });
};

export const getOnlineUsers = () => onlineUsers;
