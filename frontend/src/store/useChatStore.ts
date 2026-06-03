import { create } from 'zustand';
import { Socket } from 'socket.io-client';

export interface Message {
  _id?: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface ChatRoomTicket {
  _id: string;
  roomId: string;
  status: 'open' | 'resolved';
  customerSessionId: any;
  updatedAt: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
  
  // Current user info
  sessionId: string | null;
  role: 'customer' | 'agent' | null;
  setSession: (sessionId: string, role: 'customer' | 'agent') => void;

  // Active room info
  currentRoomId: string | null;
  setCurrentRoomId: (roomId: string | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // Agent specific
  activeRooms: ChatRoomTicket[];
  setActiveRooms: (rooms: ChatRoomTicket[]) => void;
  updateRoom: (room: ChatRoomTicket) => void;
  
  // Connection state
  isConnected: boolean;
  setIsConnected: (status: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
  
  sessionId: null,
  role: null,
  setSession: (sessionId, role) => set({ sessionId, role }),

  currentRoomId: null,
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  activeRooms: [],
  setActiveRooms: (rooms) => set({ activeRooms: rooms }),
  updateRoom: (room) => set((state) => {
    const existing = state.activeRooms.find(r => r.roomId === room.roomId);
    if (existing) {
      return { activeRooms: state.activeRooms.map(r => r.roomId === room.roomId ? room : r) };
    }
    return { activeRooms: [room, ...state.activeRooms] };
  }),

  isConnected: false,
  setIsConnected: (status) => set({ isConnected: status }),
}));
