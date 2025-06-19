import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="text-white" size={16} />
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">SecureAWS is typing</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
