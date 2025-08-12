"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useNotifications } from "../hooks/useNotifications";
import Image from "next/image";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  status: "SENT" | "DELIVERED" | "READ";
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface Conversation {
  partner: {
    _id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface InstagramChatProps {
  onNotificationClick?: (notification: any) => void;
}

const InstagramChat: React.FC<InstagramChatProps> = ({
  onNotificationClick,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (partnerId: string) => {
      if (!user?.token) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${partnerId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?.token]
  );

  // Send message
  const sendMessage = async () => {
    if (!user?.token || !selectedConversation || !newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            receiverId: selectedConversation.partner._id,
            content: newMessage.trim(),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.data]);
        setNewMessage("");

        // Update conversation list
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.partner._id);
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on("new_message", (data: any) => {
      const newMessage: Message = {
        _id: data.id || Date.now().toString(),
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId || user?.id,
        createdAt: data.timestamp || new Date().toISOString(),
        status: "SENT",
        sender: {
          _id: data.senderId,
          name: data.senderName,
          avatar: data.senderAvatar,
        },
        receiver: {
          _id: data.receiverId || user?.id,
          name: user?.name || "",
          avatar: user?.avatar,
        },
      };

      setMessages((prev) => [...prev, newMessage]);

      // Update conversation list
      fetchConversations();

      // Show notification toast
      if (onNotificationClick) {
        onNotificationClick({
          _id: newMessage._id,
          title: `${data.senderName} чам руу чат бичсэн байна`,
          content:
            data.content.length > 50
              ? data.content.substring(0, 50) + "..."
              : data.content,
          senderId: {
            _id: data.senderId,
            name: data.senderName,
            avatar: data.senderAvatar,
          },
          createdAt: new Date().toISOString(),
        });
      }
    });

    return () => {
      socket.off("new_message");
    };
  }, [
    socket,
    user?.id,
    user?.name,
    user?.avatar,
    fetchConversations,
    onNotificationClick,
  ]);

  // Initial fetch
  useEffect(() => {
    if (user?.token) {
      fetchConversations();
    }
  }, [user?.token, fetchConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <h3 className="font-semibold">Чат</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex flex-col h-full">
                {!selectedConversation ? (
                  // Conversations List
                  <div className="flex-1 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Хайх..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Уншиж байна...
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Чат байхгүй байна
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredConversations.map((conversation) => (
                            <div
                              key={conversation.partner._id}
                              onClick={() =>
                                handleConversationSelect(conversation)
                              }
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  {conversation.partner.avatar ? (
                                    <Image
                                      src={conversation.partner.avatar}
                                      alt={conversation.partner.name}
                                      width={40}
                                      height={40}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                                        {conversation.partner.name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  {conversation.partner.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                      {conversation.partner.name}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                        {conversation.unreadCount > 99
                                          ? "99+"
                                          : conversation.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {conversation.lastMessage.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Chat Interface
                  <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <div className="flex items-center space-x-2">
                          {selectedConversation.partner.avatar ? (
                            <Image
                              src={selectedConversation.partner.avatar}
                              alt={selectedConversation.partner.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                {selectedConversation.partner.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedConversation.partner.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedConversation.partner.isOnline
                                ? "Онлайн"
                                : "Офлайн"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {loading ? (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          Уншиж байна...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          Мессеж байхгүй байна
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${
                              message.senderId === user?.id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg ${
                                message.senderId === user?.id
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString(
                                  "mn-MN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          placeholder="Мессеж бичих..."
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={sending}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstagramChat;
