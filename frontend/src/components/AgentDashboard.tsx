'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore, ChatRoomTicket } from '../store/useChatStore';
import { createSession, fetchRooms, fetchMessages, SOCKET_URL } from '../lib/api';
import { Search, Send, User, MessageSquare } from 'lucide-react';

export default function AgentDashboard() {
  const { 
    socket, setSocket, 
    sessionId, setSession, 
    currentRoomId, setCurrentRoomId,
    messages, setMessages, addMessage,
    activeRooms, setActiveRooms, updateRoom
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initializeAgent = async () => {
      let storedSessionId = localStorage.getItem('agentSessionId');
      if (!storedSessionId) {
        const session = await createSession('agent');
        storedSessionId = session.sessionId;
        localStorage.setItem('agentSessionId', storedSessionId!);
      }
      setSession(storedSessionId!, 'agent');

      // Connect Socket
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        // Fetch all rooms initially
        fetchRooms().then(rooms => setActiveRooms(rooms));
      });

      newSocket.on('room_created', (room) => {
        updateRoom(room);
      });

      newSocket.on('new_global_message', (msg) => {
        // Handle global updates if needed, e.g. bumping room to top
        fetchRooms().then(rooms => setActiveRooms(rooms));
      });

      return () => {
        newSocket.disconnect();
      };
    };

    if (!socket) {
      initializeAgent();
    }
  }, []);

  // When agent selects a room
  useEffect(() => {
    if (currentRoomId && socket && sessionId) {
      socket.emit('join_room', { roomId: currentRoomId, sessionId, role: 'agent' });
      fetchMessages(currentRoomId).then(setMessages);

      // Clear previous message listener and setup for current room
      socket.off('receive_message');
      socket.on('receive_message', (msg) => {
        if (msg.roomId === currentRoomId) {
          addMessage(msg);
        }
      });
    }
  }, [currentRoomId, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !sessionId || !currentRoomId) return;

    socket.emit('send_message', {
      roomId: currentRoomId,
      senderId: sessionId,
      content: inputText.trim()
    });
    
    setInputText('');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-indigo-600" />
            Support Inbox
          </h2>
          <div className="mt-4 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeRooms.map(room => (
            <div 
              key={room.roomId}
              onClick={() => setCurrentRoomId(room.roomId)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${currentRoomId === room.roomId ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-800 text-sm truncate pr-2">
                  Visitor {room.customerSessionId?.sessionId?.substring(0,6) || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(room.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 truncate">
                  Ticket: {room.status}
                </span>
                {room.status === 'open' && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoomId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Visitor {activeRooms.find(r => r.roomId === currentRoomId)?.customerSessionId?.sessionId?.substring(0,6)}
                  </h3>
                  <p className="text-xs text-gray-500">Room: {currentRoomId}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === sessionId;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-300 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                >
                  <span>Send</span>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No conversation selected</h3>
              <p className="text-sm text-gray-400">Select a chat from the sidebar to start replying.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
