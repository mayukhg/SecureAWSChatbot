import { ThumbsUp, ThumbsDown, Copy, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage, MessageSource } from '@shared/schema';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback: (messageId: number, feedback: 'positive' | 'negative') => void;
}

export function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const timestamp = message.timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content.replace(/<[^>]*>/g, ''));
  };

  const getSourceBadgeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  if (message.type === 'user') {
    return (
      <div className="flex items-start space-x-3 justify-end message-enter">
        <div className="max-w-2xl">
          <div className="bg-blue-600 text-white rounded-lg p-4">
            <p>{message.content}</p>
          </div>
          <div className="flex items-center justify-end mt-2 space-x-2">
            <span className="text-xs text-gray-500">{timestamp}</span>
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={12} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 message-enter">
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="text-white" size={16} />
      </div>
      <div className="max-w-3xl">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-medium text-gray-900">SecureAWS Assistant</span>
            {message.sources?.map((source: MessageSource, index: number) => (
              <Badge key={index} className={getSourceBadgeColor(source.color)}>
                {source.name}
              </Badge>
            ))}
          </div>
          <div 
            className="text-gray-900 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{timestamp}</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-6 w-6 ${message.feedback === 'positive' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              onClick={() => onFeedback(message.id, 'positive')}
              disabled={message.feedback !== null}
            >
              <ThumbsUp size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-6 w-6 ${message.feedback === 'negative' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
              onClick={() => onFeedback(message.id, 'negative')}
              disabled={message.feedback !== null}
            >
              <ThumbsDown size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-gray-500 hover:text-gray-700"
              onClick={handleCopy}
            >
              <Copy size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
