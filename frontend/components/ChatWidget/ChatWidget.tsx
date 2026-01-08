// ChatWidget Component - Main chat interface for task management

"use client";

import React from "react";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "./MessageList";
import { InputField } from "./InputField";

interface ChatWidgetProps {
  userId: string;
  token?: string | null;
  initialConversationId?: string;
  onConversationStart?: (id: string) => void;
  onMessageSent?: (message: string) => void;
  className?: string;
}

export function ChatWidget({
  userId,
  token,
  initialConversationId,
  onConversationStart,
  onMessageSent,
  className = "",
}: ChatWidgetProps) {
  const {
    messages,
    conversationId,
    loading,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    clearError,
    isReady,
  } = useChat({
    userId,
    token,
    initialConversationId,
    onConversationStart,
    onMessageSent,
  });

  const handleSend = async () => {
    await sendMessage(inputValue);
  };

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500">Not authenticated</p>
          <p className="text-sm text-gray-400 mt-1">Please log in to use the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
        <h2 className="font-semibold">Task Chat Assistant</h2>
        <p className="text-xs opacity-90">
          {conversationId ? `Chat ID: ${conversationId.substring(0, 8)}...` : "New conversation"}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message List */}
      <MessageList messages={messages} loading={loading} />

      {/* Input Field */}
      <InputField
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={loading}
        placeholder="Type a message... (Ctrl+Enter to send)"
      />
    </div>
  );
}

export default ChatWidget;
