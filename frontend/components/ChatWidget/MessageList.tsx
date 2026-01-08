// Message List Component - Displays conversation history

import React from "react";
import { ChatMessage, ToolCall } from "@/hooks/useChat";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-center">
          <div className="max-w-xs space-y-3 animate-fade-in">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium">How can I help you today?</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ask me to create, update, or manage your tasks. I can also help organize your schedule.
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id || message.timestamp?.getTime()}
          className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} animate-slide-in group`}
        >
          <div
            className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm border ${
              message.sender === "user"
                ? "bg-blue-600 text-white rounded-br-sm border-blue-600"
                : "bg-white text-gray-800 rounded-bl-sm border-gray-100"
            }`}
          >
            <p className="text-[0.9375rem] whitespace-pre-wrap leading-relaxed">{message.content}</p>

            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-opacity-30 border-current">
                <div className="flex items-center gap-1.5 mb-2 opacity-80">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider">Action processed</span>
                </div>
                <div className="space-y-1.5">
                  {message.toolCalls.map((tool, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-black/5 rounded px-2 py-1">
                      <span className="font-mono">{tool.tool}</span>
                      {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                        <span className="opacity-70 text-[10px]">
                          {Object.keys(tool.parameters).length} params
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className={`text-[10px] text-gray-400 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            {message.timestamp?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1.5 min-w-[3.5rem] justify-center">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      <div className="h-1" /> {/* Scroll anchor */}
    </div>
  );
}
