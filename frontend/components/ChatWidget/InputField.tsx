// Input Field Component - Message composition

import React, { useRef, useEffect } from "react";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputField({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type a message... (Ctrl+Enter to send)",
}: InputFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-gray-100 p-4 bg-gray-50/50">
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="w-full px-4 py-3 bg-transparent border-none rounded-xl focus:ring-0 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed text-[0.9375rem] max-h-[150px] custom-scrollbar placeholder:text-gray-400"
        />

        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-[10px] font-medium text-orange-500 pl-2 h-4">
            {value.length > 0 && value.length < 5
              ? `${5 - value.length} more`
              : ""}
          </p>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] text-gray-400 font-medium px-2 py-1 bg-gray-50 rounded border border-gray-100">
              ⌘ + ↵
            </span>
            <button
              onClick={onSend}
              disabled={disabled || value.trim().length === 0}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              aria-label="Send message"
            >
              {disabled ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
