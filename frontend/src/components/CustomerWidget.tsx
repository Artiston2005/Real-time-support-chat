'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useChatStore } from '../store/useChatStore';
import { createSession, fetchMessages, SOCKET_URL } from '../lib/api';
import { v4 as uuidv4 } from 'uuid';
import { MessageCircle, X, Send, User } from 'lucide-react';

export default function CustomerWidget() {
  const { 
    socket, setSocket, 
    sessionId, setSession, 
    currentRoomId, setCurrentRoomId,
    messages, setMessages, addMessage,
    isConnected, setIsConnected
  } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 1. Get or create session
        let storedSessionId = localStorage.getItem('customerSessionId');
        if (!storedSessionId) {
          const session = await createSession('customer');
          if (session && session.sessionId) {
            storedSessionId = session.sessionId;
            localStorage.setItem('customerSessionId', storedSessionId);
          } else {
            console.error('Failed to retrieve sessionId from backend');
            return;
          }
        }
        setSession(storedSessionId, 'customer');

        // 2. Room ID is tied to session ID for customers (1-to-1)
        const roomId = `room_${storedSessionId}`;
        setCurrentRoomId(roomId);

        // 3. Connect Socket
        const newSocket = io(SOCKET_URL);
        
        newSocket.on('connect', () => {
          setIsConnected(true);
          newSocket.emit('join_room', { roomId, sessionId: storedSessionId, role: 'customer' });
        });

        newSocket.on('disconnect', () => {
          setIsConnected(false);
        });

        newSocket.on('receive_message', (msg) => {
          addMessage(msg);
        });

        setSocket(newSocket);

        // 4. Fetch past messages
        const pastMessages = await fetchMessages(roomId);
        if (Array.isArray(pastMessages)) {
          setMessages(pastMessages);
        } else {
          setMessages([]);
        }

        return () => {
          newSocket.disconnect();
        };
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      }
    };

    if (isOpen && !socket) {
      initializeChat();
    }
  }, [isOpen]);

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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Widget Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-semibold text-lg">Support Support</h3>
              <div className="flex items-center text-indigo-200 text-xs mt-1">
                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isConnected ? 'Agent Online' : 'Connecting...'}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">
                Send a message to start chatting!
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === sessionId;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <User size={16} className="text-indigo-600" />
                    </div>
                  )}
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
