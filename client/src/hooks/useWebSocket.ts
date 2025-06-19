import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage, ChatMessage } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'message') {
          const chatMessage: ChatMessage = {
            id: message.data.id,
            type: message.data.type,
            content: message.data.content,
            sources: message.data.sources,
            feedback: message.data.feedback,
            timestamp: new Date(message.data.timestamp)
          };
          
          setMessages(prev => [...prev, chatMessage]);
        } else if (message.type === 'typing') {
          setIsTyping(message.data.isTyping);
        } else if (message.type === 'error') {
          console.error('WebSocket error:', message.data.message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = useCallback((conversationId: number, content: string, userId: string = 'anonymous') => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'message',
        data: { conversationId, content, userId }
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const sendFeedback = useCallback((messageId: number, feedback: 'positive' | 'negative') => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'feedback',
        data: { messageId, feedback }
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    messages,
    isTyping,
    sendMessage,
    sendFeedback,
    setMessages
  };
}
