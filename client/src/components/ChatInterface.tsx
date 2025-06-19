import { useEffect, useRef } from 'react';
import { Bot, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@shared/schema';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  onSendMessage: (content: string) => void;
  onFeedback: (messageId: number, feedback: 'positive' | 'negative') => void;
}

export function ChatInterface({ 
  messages, 
  isTyping, 
  isConnected, 
  onSendMessage, 
  onFeedback 
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Add welcome message if no messages exist
  const displayMessages = messages.length === 0 ? [
    {
      id: 0,
      type: 'bot' as const,
      content: `<p class="mb-2">Hello! I'm your AWS security assistant. I can help you with:</p>
                <ul class="list-disc ml-4 space-y-1 text-sm">
                  <li>AWS Well-Architected Framework security best practices</li>
                  <li>Internal security policies from Confluence</li>
                  <li>Service-specific security configurations</li>
                  <li>Code examples and implementation guidance</li>
                </ul>
                <p class="mt-2 text-sm">Ask me anything about AWS security!</p>`,
      sources: [{ name: 'AWS Expert', color: 'orange', type: 'general' as const }],
      feedback: null,
      timestamp: new Date()
    }
  ] : messages;

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={16} />
            </div>
            <div>
              <h2 className="font-medium text-gray-900">SecureAWS Assistant</h2>
              <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Online' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <History size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onFeedback={onFeedback}
          />
        ))}
        
        <TypingIndicator isVisible={isTyping} />
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <MessageInput 
        onSendMessage={onSendMessage}
        disabled={!isConnected}
      />
    </div>
  );
}
