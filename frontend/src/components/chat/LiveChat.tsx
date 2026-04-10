// frontend/src/components/chat/LiveChat.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Minimize2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

interface Message {
  id: string; senderId: string; content: string;
  type: string; createdAt: string;
}

interface LiveChatProps {
  roomId: string;
  otherUser: { id: string; name: string; avatar?: string };
  onClose: () => void;
}

export function LiveChat({ roomId, otherUser, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();
  const { user } = useAuthStore();
  const { joinRoom, sendMessage, onMessage, sendTyping, onTyping } = useSocket();

  // Load history
  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await api.get(`/api/chat/rooms/${roomId}/messages`);
        setMessages(data);
      } finally {
        setLoading(false);
      }
    };
    load();
    joinRoom(roomId);
  }, [roomId, joinRoom]);

  // Listen for new messages
  useEffect(() => {
    const off = onMessage((msg: Message) => {
      if (msg.roomId !== roomId) return;
      setMessages(prev => [...prev, msg]);
    });
    return off;
  }, [onMessage, roomId]);

  // Listen for typing
  useEffect(() => {
    const off = onTyping((data: any) => {
      if (data.userId === user?.id) return;
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
    });
    return off;
  }, [onTyping, user?.id]);

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    await sendMessage(roomId, content);
  }, [input, roomId, sendMessage]);

  const handleTyping = () => {
    sendTyping(roomId);
  };

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full cursor-pointer
          flex items-center gap-2 shadow-lg z-50"
      >
        💬 Chat with {otherUser.name}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-2xl
      shadow-2xl z-50 flex flex-col overflow-hidden" style={{ height: 420 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {otherUser.name[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{otherUser.name}</p>
            {isTyping && <p className="text-gray-400 text-xs">typing...</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setMinimized(true)} className="text-gray-400 hover:text-white p-1">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center text-gray-500 text-sm py-4">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            Start the conversation!
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                  msg.senderId === user?.id
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-700 text-white rounded-bl-sm'
                }`}
              >
                {msg.content}
                <div className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2
            focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2 rounded-full transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
