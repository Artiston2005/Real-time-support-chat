import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';
import ChatRoomTicket from './models/ChatRoomTicket';
import Message from './models/Message';
import UserSession from './models/UserSession';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/chats', chatRoutes);

io.on('connection', (socket: Socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_room', async (data: { roomId: string, sessionId: string, role: string }) => {
    const { roomId, sessionId, role } = data;
    socket.join(roomId);
    console.log(`User ${sessionId} (${role}) joined room ${roomId}`);

    // Create a ticket if it doesn't exist and user is customer
    if (role === 'customer') {
      try {
        let session = await UserSession.findOne({ sessionId });
        if (!session) {
          // Auto-create session if it was lost due to memory db restart
          session = new UserSession({ sessionId, role: 'customer' });
          await session.save();
        }
        
        const existingTicket = await ChatRoomTicket.findOne({ roomId });
        if (!existingTicket) {
          const newTicket = new ChatRoomTicket({
            roomId,
            customerSessionId: session._id,
            status: 'open',
          });
          await newTicket.save();
          // Notify agents about new room
          io.emit('room_created', newTicket);
        }
      } catch (err) {
        console.error('Error creating ticket:', err);
      }
    } else if (role === 'agent') {
      try {
        let session = await UserSession.findOne({ sessionId });
        if (!session) {
          session = new UserSession({ sessionId, role: 'agent' });
          await session.save();
        }
      } catch (err) {
        console.error('Error auto-creating agent session:', err);
      }
    }
  });

  socket.on('send_message', async (data: { roomId: string, senderId: string, content: string }) => {
    const { roomId, senderId, content } = data;
    
    try {
      const newMessage = new Message({
        roomId,
        senderId,
        content
      });
      await newMessage.save();

      // Update room updatedAt
      await ChatRoomTicket.findOneAndUpdate({ roomId }, { updatedAt: new Date() });

      // Broadcast to room
      io.to(roomId).emit('receive_message', newMessage);
      
      // Also broadcast globally for agent dashboard to update latest message preview
      io.emit('new_global_message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('typing', (data: { roomId: string, isTyping: boolean, senderId: string }) => {
    socket.to(data.roomId).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/support-chat';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to local MongoDB...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to local MongoDB');
  } catch (err) {
    console.log('Local MongoDB not found. Starting in-memory MongoDB server for testing...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('Connected to In-Memory MongoDB at', memoryUri);
  }
};

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Fatal error connecting to database', err);
});
