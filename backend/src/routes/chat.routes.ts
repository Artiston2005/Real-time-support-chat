import { Router, Request, Response } from 'express';
import ChatRoomTicket from '../models/ChatRoomTicket';
import Message from '../models/Message';
import UserSession from '../models/UserSession';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Endpoint to initialize or retrieve a session
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const sessionId = uuidv4();
    const session = new UserSession({
      sessionId,
      role: role || 'customer',
    });
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Endpoint to get all chat rooms (for Agent Dashboard)
router.get('/rooms', async (req: Request, res: Response) => {
  try {
    const rooms = await ChatRoomTicket.find().sort({ updatedAt: -1 }).populate('customerSessionId');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Endpoint to get messages for a specific room
router.get('/rooms/:roomId/messages', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
