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
    <div className="border-t border-gray-200 p-4 space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {value.length > 0 && value.length < 5
            ? `${5 - value.length} more characters`
            : ""}
        </p>

        <div className="flex space-x-2">
          <button
            onClick={onSend}
            disabled={disabled || value.trim().length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {disabled ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
