// ChatWidget Component - Main chat interface for task management

"use client";

import { useChat } from "@/hooks/useChat";
import { MessageList } from "./MessageList";
import { InputField } from "./InputField";

interface ChatWidgetProps {
  userId: string;
  token?: string | null;
  initialConversationId?: string;
  onConversationStart?: (id: string) => void;
  onMessageSent?: (message: string) => void;
  onRefreshTasks?: () => void;
  className?: string;
}

export function ChatWidget({
  userId,
  token,
  initialConversationId,
  onConversationStart,
  onMessageSent,
  onRefreshTasks,
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
    onRefreshTasks,
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
      className={`flex flex-col h-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 ${className}`}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="font-semibold text-gray-900 leading-tight">Assistant</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {conversationId ? `Active` : "Ready to help"}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-start justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-700 transition-colors"
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
        placeholder="Type a message..."
      />
    </div>
  );
}

export default ChatWidget;
