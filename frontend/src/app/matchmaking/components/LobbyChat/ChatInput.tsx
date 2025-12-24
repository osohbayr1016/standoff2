import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-gray-700 bg-gray-800/50">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm disabled:opacity-50"
        maxLength={200}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;

