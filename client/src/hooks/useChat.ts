import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Conversation, ChatMessage } from '@shared/schema';

export function useChat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { userId: string; title?: string }) => {
      const response = await apiRequest('POST', '/api/conversations', data);
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setCurrentConversationId(conversation.id);
    }
  });

  // Get quick actions
  const { data: quickActions = [] } = useQuery({
    queryKey: ['/api/quick-actions'],
  });

  // Initialize conversation on mount
  useEffect(() => {
    if (!currentConversationId) {
      createConversationMutation.mutate({
        userId: 'anonymous',
        title: 'AWS Security Chat'
      });
    }
  }, []);

  return {
    currentConversationId,
    quickActions,
    createConversation: createConversationMutation.mutate,
    isCreatingConversation: createConversationMutation.isPending
  };
}
