# ChatWidget Component Design

## Overview

The ChatWidget is the primary interface for task management via natural language chat. It's embedded in the dashboard and provides a stateful conversation experience while the backend remains stateless.

## Architecture

### Component Structure

```
ChatWidget (Main Container)
├── MessageList (Messages Display)
│   ├── Message (Individual message row)
│   │   ├── Avatar (User/Assistant indicator)
│   │   ├── Content (Message text)
│   │   └── ToolCalls (Display executed tools)
│   └── ScrollContainer (Auto-scroll to latest)
├── InputField (Message composition)
│   ├── TextInput (textarea for multiline)
│   ├── SendButton (with loading state)
│   └── Hints (command suggestions)
└── ConversationContext (State management)
```

### State Management

```typescript
interface ChatState {
  conversationId?: string;        // Current conversation ID
  messages: Message[];            // Full message history
  loading: boolean;               // Request in flight
  error?: string;                 // Last error message
  inputValue: string;             // Current text input
}

interface Message {
  id: string;                     // Message ID
  sender: "user" | "assistant";   // Who sent it
  content: string;                // Message text
  toolCalls?: ToolCall[];         // Tools executed
  timestamp: Date;                // When sent
}
```

### Props Interface

```typescript
interface ChatWidgetProps {
  userId: string;                 // Authenticated user ID
  apiBaseUrl?: string;            // API endpoint (default: /api)
  initialConversationId?: string; // Resume existing conversation
  onConversationStart?: (id: string) => void;
  onMessageSent?: (message: string) => void;
  className?: string;             // Tailwind classes for styling
}
```

## Behavior

### Conversation Flow

1. **Initialization**
   - If `initialConversationId`, load existing conversation
   - Otherwise, conversation created on first message

2. **Message Sending**
   - User types message and clicks Send (or Ctrl+Enter)
   - Message added to local state immediately (optimistic update)
   - Request sent to `/api/{userId}/chat` endpoint
   - Wait for response with assistant message and tool calls
   - Update conversation with response
   - Auto-scroll to latest message

3. **Error Handling**
   - Network errors: Display error message, keep local message
   - Validation errors: Show error hint inline
   - Server errors: Display user-friendly message with retry

4. **Loading States**
   - Send button disabled while request in flight
   - Loading indicator in message list
   - Input focused for next message

## Styling

### Layout
- Responsive height: 100% of container (flex-fill)
- Message list scrolls, input stays fixed at bottom
- Padding: 16px (mobile), 20px (desktop)
- Font: System font stack for performance

### Colors & Theme
- User messages: Blue background (#3B82F6)
- Assistant messages: Gray background (#F3F4F6)
- Tool calls: Green accent (#10B981)
- Errors: Red accent (#EF4444)
- Follows dashboard's Tailwind theme

### Responsive Design
- Mobile (< 640px):
  - Full width, bottom sheet style
  - Larger tap targets (48px minimum)
  - Simplified UI

- Desktop (≥ 640px):
  - Side panel (right 400px)
  - Hover effects on messages
  - Compact UI

## Accessibility

- Keyboard navigation (Tab, Shift+Tab, Enter)
- Focus visible on all interactive elements
- ARIA labels for screen readers
- High contrast text (WCAG AA compliant)
- Message list announces new messages to screen readers

## Performance Considerations

1. **Message Virtualization**
   - Only render visible messages initially
   - Lazy load older messages on scroll up
   - Limit in-memory history to last 100 messages

2. **Request Optimization**
   - Single request per message (no debouncing)
   - Reuse API client with connection pooling
   - Cache user ID in context to avoid prop drilling

3. **Bundle Size**
   - No external chat library dependencies
   - Minimal component count
   - Inline SVG icons instead of separate files

## Security

1. **Authentication**
   - JWT token from session storage
   - Injected in Authorization header (Bearer token)
   - Token refreshed before expiry

2. **Input Validation**
   - Trim whitespace from messages
   - Reject empty messages (client-side)
   - Sanitize HTML in responses (server-side)

3. **User Isolation**
   - All requests include user_id in path
   - Server validates user_id matches JWT
   - No cross-user data possible

## Testing Strategy

### Unit Tests
- Message rendering
- State updates
- Input validation
- Error handling

### Integration Tests
- Send message flow
- Load conversation flow
- Error recovery

### E2E Tests
- Full conversation lifecycle
- Keyboard navigation
- Mobile responsiveness

## Future Enhancements

- Rich message formatting (markdown, code blocks)
- File attachments
- Typing indicators
- Conversation search
- Multi-turn context window optimization
- Voice input/output (Phase 2)
