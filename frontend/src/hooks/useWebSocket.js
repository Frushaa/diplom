import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { 
  updateUnreadCount,
  addNotification 
} from '../store/slices/notificationsSlice';

export default function useWebSocket() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const socketRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (!token || document.visibilityState === 'hidden') return;
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss://' : 'ws://'}${window.location.host}/ws?token=${token}`
    );

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received WS message:', message);

        switch(message.type) {
          case 'notification':
            dispatch(addNotification(message.data));
            dispatch(updateUnreadCount(1));
            
            break;
          default:
            console.warn('Unknown WS message type:', message.type);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(connectWebSocket, 10000);
    };

    socketRef.current = socket;
    return socket;
  }, [token, dispatch]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return socketRef.current;
}