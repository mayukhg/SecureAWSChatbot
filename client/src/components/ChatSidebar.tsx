import { Shield, Circle, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChatSidebarProps {
  quickActions: Array<{ label: string; query: string }>;
  onQuickAction: (query: string) => void;
}

export function ChatSidebar({ quickActions, onQuickAction }: ChatSidebarProps) {
  const knowledgeSources = [
    { name: 'AWS Well-Architected Framework', status: 'online' },
    { name: 'Internal Confluence', status: 'online' },
    { name: 'Amazon Q Knowledge', status: 'online' }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SecureAWS</h1>
            <p className="text-sm text-gray-600">AWS Security Assistant</p>
          </div>
        </div>
      </div>
      
      {/* Stats/Info Section */}
      <div className="p-4 space-y-4">
        <Card className="p-3 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Knowledge Sources</h3>
          <div className="space-y-2">
            {knowledgeSources.map((source, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span className="text-xs text-gray-600">{source.name}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-3 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-blue-600 hover:bg-white h-auto p-2"
                onClick={() => onQuickAction(action.query)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
