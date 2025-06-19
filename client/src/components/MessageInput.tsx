import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const content = message.trim();
    if (!content || disabled) return;
    
    onSendMessage(content);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about AWS security best practices..."
              className="resize-none pr-12 min-h-[44px] max-h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
            <Button
              size="sm"
              className="absolute right-3 bottom-2 h-8 w-8 p-0"
              onClick={handleSend}
              disabled={!message.trim() || disabled}
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <Button variant="ghost" size="sm" className="h-6 px-2 py-1">
                <Paperclip size={12} className="mr-1" />
                Attach
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 py-1">
                <Code size={12} className="mr-1" />
                Code
              </Button>
            </div>
            <span className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
