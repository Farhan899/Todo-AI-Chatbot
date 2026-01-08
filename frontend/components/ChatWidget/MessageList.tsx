// Message List Component - Displays conversation history

import React from "react";
import { ChatMessage, ToolCall } from "@/hooks/useChat";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-center text-gray-400">
          <div>
            <p className="text-lg font-semibold">Start a conversation</p>
            <p className="text-sm mt-2">
              Ask me to create, list, complete, update, or delete tasks
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id || message.timestamp?.getTime()}
          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              message.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-100 text-gray-900 rounded-bl-none"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-2 pt-2 border-t border-opacity-20 border-gray-400">
                <p className="text-xs font-semibold mb-1">Tools executed:</p>
                <div className="space-y-1">
                  {message.toolCalls.map((tool, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-semibold">{tool.tool}</span>
                      {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                        <span className="ml-1 opacity-75">
                          ({Object.keys(tool.parameters).length} params)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs opacity-70 mt-1">
              {message.timestamp?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}

      <div className="h-1" /> {/* Scroll anchor */}
    </div>
  );
}
