/**
 * useChat Hook - Manages chat state and API interactions
 *
 * Features:
 * - Conversation state management (messages, loading, error)
 * - Optimistic message updates
 * - Auto-scroll to latest message
 * - Error recovery and retry logic
 * - Memory-efficient message history (limit to 100)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatAPIClient, ChatMessage, ToolCall } from "@/lib/chat-api";

interface UseChatOptions {
  userId: string;
  token?: string | null;
  initialConversationId?: string;
  onConversationStart?: (id: string) => void;
  onMessageSent?: (message: string) => void;
  apiBaseUrl?: string;
}

interface UseChatReturn {
  // State
  messages: ChatMessage[];
  conversationId?: string;
  loading: boolean;
  error?: string;
  inputValue: string;

  // Actions
  setInputValue: (value: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  resetConversation: () => void;

  // Derived state
  isEmpty: boolean;
  isReady: boolean;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api";

export function useChat(options: UseChatOptions): UseChatReturn {
  const {
    userId,
    token,
    initialConversationId,
    onConversationStart,
    onMessageSent,
    apiBaseUrl = API_URL,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [inputValue, setInputValue] = useState("");

  // Refs
  const clientRef = useRef<ChatAPIClient>(new ChatAPIClient(userId, token || null, apiBaseUrl));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update apiClient when userId, token or apiBaseUrl changes
  useEffect(() => {
    clientRef.current = new ChatAPIClient(userId, token || null, apiBaseUrl);
  }, [userId, token, apiBaseUrl]);

  // Derived state
  const isEmpty = messages.length === 0;
  const isReady = !!userId && clientRef.current.isAuthenticated();

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Load initial conversation if provided
  useEffect(() => {
    if (initialConversationId && messages.length === 0) {
      // TODO: Load conversation history from server
      // For now, just set the conversation ID
      setConversationId(initialConversationId);
    }
  }, [initialConversationId, messages.length]);

  // Send message to API
  const sendMessage = useCallback(
    async (messageText: string) => {
      const trimmed = messageText.trim();

      // Validation
      if (!trimmed) {
        setError("Message cannot be empty");
        return;
      }

      if (!isReady) {
        setError("Not authenticated. Please log in.");
        return;
      }

      // Clear previous error
      setError(undefined);

      // Optimistic update: add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      onMessageSent?.(trimmed);

      // Send to API
      setLoading(true);
      try {
        const response = await clientRef.current.sendMessage(
          trimmed,
          conversationId,
          false // include_context = false for Phase 3
        );

        // Update conversation ID if new conversation
        if (!conversationId) {
          setConversationId(response.conversation_id);
          onConversationStart?.(response.conversation_id);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: response.conversation_id,
          sender: "assistant",
          content: response.assistant_message,
          toolCalls: response.tool_calls.length > 0 ? response.tool_calls : undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Limit message history to last 100 messages (memory efficiency)
        setMessages((prev) => {
          if (prev.length > 100) {
            return prev.slice(-100);
          }
          return prev;
        });
      } catch (err) {
        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to send message. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [conversationId, isReady, onConversationStart, onMessageSent]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // Reset conversation
  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setError(undefined);
    setInputValue("");
  }, []);

  return {
    messages,
    conversationId,
    loading,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    clearError,
    resetConversation,
    isEmpty,
    isReady,
  };
}

export type { ChatMessage, ToolCall };
