import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setConnectionStatus, setLastHeartbeat, incrementReconnectAttempts, resetReconnectAttempts } from '../store/connectionSlice';
import { addNewMessage } from '../store/messagesSlice';
import { updateChatLastMessage } from '../store/chatsSlice';

const WS_URL = 'ws://localhost:8080';
const HEARTBEAT_INTERVAL = 10000;
const MAX_RECONNECT_DELAY = 30000;
const BASE_RECONNECT_DELAY = 1000;

export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    clearTimers();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, [clearTimers]);

  const reconnect = useCallback(() => {
    clearTimers();
    
    // Exponential backoff with jitter
    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current) + Math.random() * 1000,
      MAX_RECONNECT_DELAY
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
    dispatch(setConnectionStatus('reconnecting'));
    dispatch(incrementReconnectAttempts());
    reconnectAttemptsRef.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [dispatch]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        dispatch(setConnectionStatus('connected'));
        dispatch(resetReconnectAttempts());
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'connected':
              console.log('Connection acknowledged');
              break;

            case 'new_message':
              const message = data.data;
              dispatch(addNewMessage(message));
              dispatch(updateChatLastMessage({ 
                chatId: message.chatId, 
                timestamp: message.ts 
              }));
              break;

            case 'heartbeat':
              dispatch(setLastHeartbeat(data.timestamp));
              break;

            case 'pong':
              dispatch(setLastHeartbeat(data.timestamp));
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        dispatch(setConnectionStatus('offline'));
        clearTimers();
        reconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      reconnect();
    }
  }, [dispatch, startHeartbeat, reconnect, clearTimers]);

  useEffect(() => {
    connect();

    return () => {
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, clearTimers]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};
