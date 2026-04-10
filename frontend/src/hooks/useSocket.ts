// frontend/src/hooks/useSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationsStore } from '@/store';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export function useSocket() {
  const { accessToken, user } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const isConnected = useRef(false);

  useEffect(() => {
    if (!accessToken || isConnected.current) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      isConnected.current = true;
    });

    socket.on('disconnect', () => {
      isConnected.current = false;
    });

    // In-app notifications
    socket.on('notification', (notification: any) => {
      addNotification(notification);
      toast(notification.title, {
        icon: '🔔',
        duration: 4000,
      });
    });

    // Order status updates
    socket.on('order_update', (data: any) => {
      toast.success(`Order #${data.orderId.slice(0, 8)} - ${data.status}`);
    });

    return () => {
      socket?.disconnect();
      isConnected.current = false;
    };
  }, [accessToken]);

  const joinRoom = useCallback((roomId: string) => {
    socket?.emit('join_room', { roomId });
  }, []);

  const sendMessage = useCallback((roomId: string, content: string, type = 'text') => {
    return new Promise((resolve) => {
      socket?.emit('send_message', { roomId, content, type }, resolve);
    });
  }, []);

  const onMessage = useCallback((callback: (msg: any) => void) => {
    socket?.on('new_message', callback);
    return () => socket?.off('new_message', callback);
  }, []);

  const sendTyping = useCallback((roomId: string) => {
    socket?.emit('typing', { roomId });
  }, []);

  const onTyping = useCallback((callback: (data: any) => void) => {
    socket?.on('user_typing', callback);
    return () => socket?.off('user_typing', callback);
  }, []);

  return { joinRoom, sendMessage, onMessage, sendTyping, onTyping };
}
