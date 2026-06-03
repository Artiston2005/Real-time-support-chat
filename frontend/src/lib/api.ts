export const API_URL = 'http://localhost:5000/api';
export const SOCKET_URL = 'http://localhost:5000';

export const createSession = async (role: 'customer' | 'agent') => {
  const res = await fetch(`${API_URL}/chats/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return res.json();
};

export const fetchRooms = async () => {
  const res = await fetch(`${API_URL}/chats/rooms`);
  return res.json();
};

export const fetchMessages = async (roomId: string) => {
  const res = await fetch(`${API_URL}/chats/rooms/${roomId}/messages`);
  return res.json();
};
