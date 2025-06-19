import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateSecurityResponse } from "./services/openai";
import { getQuickActions } from "./services/knowledgeBase";
import { insertMessageSchema } from "@shared/schema";
import type { WebSocketMessage, ChatMessage } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        
        if (message.type === 'message') {
          await handleChatMessage(ws, message.data);
        } else if (message.type === 'feedback') {
          await handleFeedback(message.data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Failed to process message' }
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  async function handleChatMessage(ws: WebSocket, data: any) {
    const { conversationId, content, userId } = data;
    
    // Save user message
    const userMessage = await storage.createMessage({
      conversationId: parseInt(conversationId),
      type: 'user',
      content,
      sources: null,
      feedback: null
    });

    // Send user message to client
    ws.send(JSON.stringify({
      type: 'message',
      data: {
        id: userMessage.id,
        type: 'user',
        content,
        timestamp: userMessage.createdAt
      }
    }));

    // Send typing indicator
    ws.send(JSON.stringify({
      type: 'typing',
      data: { isTyping: true }
    }));

    try {
      // Get conversation history for context
      const messages = await storage.getConversationMessages(parseInt(conversationId));
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await generateSecurityResponse(content, conversationHistory);
      
      // Save bot message
      const botMessage = await storage.createMessage({
        conversationId: parseInt(conversationId),
        type: 'bot',
        content: aiResponse.content,
        sources: aiResponse.sources,
        feedback: null
      });

      // Send bot response
      ws.send(JSON.stringify({
        type: 'message',
        data: {
          id: botMessage.id,
          type: 'bot',
          content: aiResponse.content,
          sources: aiResponse.sources,
          timestamp: botMessage.createdAt
        }
      }));
    } catch (error) {
      console.error('AI response error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to generate response' }
      }));
    } finally {
      // Stop typing indicator
      ws.send(JSON.stringify({
        type: 'typing',
        data: { isTyping: false }
      }));
    }
  }

  async function handleFeedback(data: any) {
    const { messageId, feedback } = data;
    await storage.updateMessageFeedback(parseInt(messageId), feedback);
  }

  // REST API routes
  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/conversations', async (req, res) => {
    try {
      const conversation = await storage.createConversation({
        userId: req.body.userId || 'anonymous',
        title: req.body.title || 'New Conversation'
      });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  app.get('/api/quick-actions', (req, res) => {
    res.json(getQuickActions());
  });

  app.post('/api/feedback/:messageId', async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { feedback } = req.body;
      
      const message = await storage.updateMessageFeedback(messageId, feedback);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  });

  return httpServer;
}
