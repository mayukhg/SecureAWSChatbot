# SecureAWS Teams Chatbot

A web-based prototype of an intelligent AWS security assistant that simulates the functionality described in the SecureAWS Teams Chatbot PRD. This application provides real-time, AI-powered responses to AWS security questions through a modern chat interface.

## Overview

SecureAWS is designed to be a conversational AI assistant that helps development teams with AWS security best practices. While the production version would integrate with Microsoft Teams and Amazon Q, this prototype demonstrates the core functionality using OpenAI's GPT-4o model and a web-based interface.

## Features

### Core Functionality
- **Real-time Chat Interface**: WebSocket-based communication with typing indicators
- **AI-Powered Responses**: OpenAI GPT-4o integration for intelligent AWS security guidance
- **Source Attribution**: Responses cite knowledge sources (AWS Well-Architected Framework, Confluence, General)
- **Rich Text Formatting**: HTML-formatted responses with code blocks, lists, and styled content
- **User Feedback System**: Thumbs up/down rating system for response quality
- **Quick Actions**: Pre-defined security questions for common use cases

### Knowledge Areas
- **S3 Security**: Bucket policies, encryption, access controls
- **IAM Security**: Policies, roles, least privilege principles
- **VPC Security**: Network security groups, NACLs, flow logs
- **General AWS Security**: Well-Architected Framework security pillar

### User Experience
- **Teams-Inspired Design**: Purple/blue color scheme matching Microsoft Teams
- **Responsive Layout**: Sidebar with knowledge sources and quick actions
- **Connection Status**: Real-time WebSocket connection indicator
- **Message History**: Persistent conversation storage

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with custom Teams-inspired design
- **shadcn/ui** component library for consistent UI elements
- **Wouter** for client-side routing
- **TanStack React Query** for data fetching and caching
- **WebSocket API** for real-time communication

### Backend
- **Node.js** with Express server
- **TypeScript** for type safety
- **WebSocket (ws)** for real-time chat communication
- **OpenAI API** for intelligent response generation
- **In-memory storage** for conversation and message persistence

### Development Tools
- **Vite** for fast development and hot module replacement
- **Drizzle ORM** with Zod for schema validation
- **ESBuild** for fast TypeScript compilation

## Project Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── ChatInterface.tsx    # Main chat interface
│   │   │   ├── ChatSidebar.tsx      # Sidebar with quick actions
│   │   │   ├── MessageBubble.tsx    # Individual message display
│   │   │   ├── MessageInput.tsx     # Message input with send button
│   │   │   └── TypingIndicator.tsx  # Typing animation
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useChat.ts           # Chat conversation management
│   │   │   └── useWebSocket.ts      # WebSocket connection handling
│   │   ├── lib/               # Utility libraries
│   │   │   ├── queryClient.ts       # TanStack Query configuration
│   │   │   └── utils.ts             # Utility functions
│   │   ├── pages/             # Page components
│   │   │   ├── chat.tsx             # Main chat page
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── App.tsx            # Root application component
│   │   ├── main.tsx           # Application entry point
│   │   └── index.css          # Global styles and Tailwind config
│   └── index.html             # HTML template
├── server/                     # Backend Express application
│   ├── services/              # Business logic services
│   │   ├── openai.ts                # OpenAI API integration
│   │   └── knowledgeBase.ts         # Mock knowledge base
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes and WebSocket handling
│   ├── storage.ts             # In-memory data storage
│   └── vite.ts                # Vite development server integration
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Database schema and TypeScript types
└── package.json               # Dependencies and scripts
```

## API Endpoints

### REST API
- `GET /api/conversations/:id/messages` - Retrieve conversation messages
- `POST /api/conversations` - Create new conversation
- `GET /api/quick-actions` - Get predefined quick action queries
- `POST /api/feedback/:messageId` - Submit user feedback

### WebSocket Events
- `message` - Send/receive chat messages
- `typing` - Typing indicator status
- `feedback` - User feedback submission

## Data Models

### Core Entities
- **User**: Basic user information with username/password
- **Conversation**: Chat session with title and timestamps
- **Message**: Individual messages with type (user/bot), content, sources, and feedback
- **MessageSource**: Attribution for knowledge sources with name, color, and type

### WebSocket Messages
```typescript
interface WebSocketMessage {
  type: 'message' | 'typing' | 'feedback';
  data: any;
}

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  sources?: MessageSource[];
  feedback?: 'positive' | 'negative' | null;
  timestamp: Date;
}
```

## Setup and Installation

### Prerequisites
- Node.js 20+
- OpenAI API key with available quota

### Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Key Features Implementation

### Real-time Communication
The application uses WebSocket connections for real-time chat functionality. The `useWebSocket` hook manages connection state, message handling, and typing indicators.

### AI Response Generation
OpenAI GPT-4o is prompted to act as a security expert with specific formatting guidelines. Responses are generated in JSON format with HTML content and source attribution.

### Source Attribution
All AI responses include source metadata indicating whether information comes from:
- AWS Well-Architected Framework (blue)
- Internal Confluence documentation (purple)
- General AWS knowledge (gray)

### User Feedback
Users can provide thumbs up/down feedback on bot responses, which is stored and could be used for model improvement in production.

### Knowledge Base
A mock knowledge base provides structured information about S3, IAM, and VPC security practices, demonstrating how real knowledge sources would be integrated.

## Production Considerations

This prototype demonstrates core functionality but would require several enhancements for production deployment:

1. **Microsoft Teams Integration**: Replace web interface with Teams Bot Framework
2. **Amazon Q Integration**: Replace OpenAI with Amazon Q for enterprise knowledge
3. **Confluence API**: Real integration with company Confluence spaces
4. **Database Storage**: Replace in-memory storage with PostgreSQL or similar
5. **Authentication**: Implement Azure AD integration for Teams users
6. **Monitoring**: Add logging, metrics, and health checks
7. **Security**: Implement proper API security and rate limiting
8. **Deployment**: Containerization and AWS serverless deployment

## Architecture Decisions

### In-Memory Storage
The application uses in-memory storage for simplicity and demonstration purposes. The `IStorage` interface abstracts storage operations, making it easy to swap implementations.

### WebSocket Communication
Real-time chat requires WebSocket connections for immediate message delivery and typing indicators, providing a smooth user experience.

### Component Architecture
The frontend uses a component-based architecture with clear separation of concerns:
- UI components handle presentation
- Hooks manage state and side effects
- Services handle external API communication

### Type Safety
TypeScript is used throughout the application with shared schemas between frontend and backend to ensure type consistency.

This prototype successfully demonstrates the core functionality of an intelligent AWS security chatbot and provides a solid foundation for extending into a full Microsoft Teams integration.