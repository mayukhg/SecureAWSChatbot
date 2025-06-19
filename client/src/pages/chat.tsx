import { useEffect } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChat } from '@/hooks/useChat';

export default function ChatPage() {
  const { 
    isConnected, 
    messages, 
    isTyping, 
    sendMessage, 
    sendFeedback,
    setMessages 
  } = useWebSocket();
  
  const { 
    currentConversationId, 
    quickActions,
    isCreatingConversation 
  } = useChat();

  const handleSendMessage = (content: string) => {
    if (currentConversationId) {
      sendMessage(currentConversationId, content);
    }
  };

  const handleQuickAction = (query: string) => {
    if (currentConversationId) {
      sendMessage(currentConversationId, query);
    }
  };

  const handleFeedback = (messageId: number, feedback: 'positive' | 'negative') => {
    sendFeedback(messageId, feedback);
    
    // Update local message state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  // Show loading state while creating conversation
  if (isCreatingConversation || !currentConversationId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing SecureAWS Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <ChatSidebar 
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
      />
      <ChatInterface
        messages={messages}
        isTyping={isTyping}
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
        onFeedback={handleFeedback}
      />
    </div>
  );
}
