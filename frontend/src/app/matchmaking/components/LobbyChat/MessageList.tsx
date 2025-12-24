import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
  id: string;
  lobbyId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
    >
      <AnimatePresence mode="wait">
        {messages.length === 0 ? (
          <motion.div 
            key="empty-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex items-center justify-center"
          >
            <p className="text-gray-500 text-xs text-center italic">
              Lobby chat is active. Messages are not saved.
            </p>
          </motion.div>
        ) : (
          <div key="message-list" className="space-y-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${
                  msg.senderId === currentUserId ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] font-bold text-orange-400">
                    {msg.senderName}
                  </span>
                  <span className="text-[9px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm max-w-[90%] break-words ${
                    msg.senderId === currentUserId
                      ? "bg-orange-600 text-white rounded-tr-none"
                      : "bg-gray-700 text-gray-200 rounded-tl-none"
                  }`}
                >
                  {msg.message}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;

