"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import Image from "next/image";
import { API_ENDPOINTS } from "../../config/api";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
}

export default function ChatModal({
  isOpen,
  onClose,
  playerId,
  playerName,
  playerAvatar,
}: ChatModalProps) {
  const { user } = useAuth();
  const {
    sendMessage: socketSendMessage,
    sendTypingStart,
    sendTypingStop,
    markMessageAsRead,
    isConnected,
  } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState("");

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages, scrollToBottom]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(API_ENDPOINTS.MESSAGES.LIST(playerId), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication expired. Please log in again.");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch messages (${response.status})`
        );
      }

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        // Scroll to bottom after loading messages
        setTimeout(() => scrollToBottom("auto"), 100);
      } else {
        throw new Error(data.message || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  }, [user, playerId, scrollToBottom]);

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      // Mark messages as read when chat is opened
      markMessageAsRead(playerId);
    }
  }, [isOpen, user, fetchMessages, markMessageAsRead, playerId]);

  // Real-time message handling
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { senderId, content, timestamp } = event.detail;

      // Only add message if it's from the current chat partner
      if (senderId === playerId) {
        const newMessage: Message = {
          id: Date.now().toString(), // Temporary ID
          content,
          senderId,
          receiverId: user?.id || "",
          createdAt: timestamp,
          sender: {
            id: senderId,
            name: playerName,
            avatar: playerAvatar,
          },
          receiver: {
            id: user?.id || "",
            name: user?.name || "",
            avatar: user?.avatar,
          },
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleUserTyping = (event: CustomEvent) => {
      const { userId } = event.detail;
      if (userId === playerId) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    };

    const handleUserStoppedTyping = (event: CustomEvent) => {
      const { userId } = event.detail;
      if (userId === playerId) {
        setOtherUserTyping(false);
      }
    };

    window.addEventListener("new_message", handleNewMessage as EventListener);
    window.addEventListener("user_typing", handleUserTyping as EventListener);
    window.addEventListener(
      "user_stopped_typing",
      handleUserStoppedTyping as EventListener
    );

    return () => {
      window.removeEventListener(
        "new_message",
        handleNewMessage as EventListener
      );
      window.removeEventListener(
        "user_typing",
        handleUserTyping as EventListener
      );
      window.removeEventListener(
        "user_stopped_typing",
        handleUserStoppedTyping as EventListener
      );
    };
  }, [playerId, playerName, playerAvatar, user]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      setError("");

      // Send via WebSocket if connected
      if (isConnected) {
        socketSendMessage(playerId, newMessage.trim());

        // Add message to local state immediately for instant feedback
        const tempMessage: Message = {
          id: Date.now().toString(),
          content: newMessage.trim(),
          senderId: user.id,
          receiverId: playerId,
          createdAt: new Date().toISOString(),
          sender: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
          receiver: {
            id: playerId,
            name: playerName,
            avatar: playerAvatar,
          },
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");
        setSending(false);
        // Scroll to bottom immediately after sending
        setTimeout(() => scrollToBottom("smooth"), 50);
        return;
      }

      // Fallback to REST API if WebSocket is not connected
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(API_ENDPOINTS.MESSAGES.SEND, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: playerId,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication expired. Please log in again.");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to send message (${response.status})`
        );
      }

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage("");
        // Scroll to bottom immediately after sending
        setTimeout(() => scrollToBottom("smooth"), 50);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing indicators
    if (isConnected) {
      if (value && !isTyping) {
        setIsTyping(true);
        sendTypingStart(playerId);
      } else if (!value && isTyping) {
        setIsTyping(false);
        sendTypingStop(playerId);
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      if (value) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          sendTypingStop(playerId);
        }, 2000);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 theme-transition"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 theme-transition">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={playerAvatar || "/default-avatar.png"}
                    alt={playerName}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                      isConnected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white theme-transition">
                    {playerName}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400 theme-transition">
                    {isConnected ? "Online" : "Connecting..."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 theme-transition scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-green-400"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`flex ${
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        } items-end space-x-2 max-w-xs lg:max-w-md`}
                      >
                        {/* Avatar for other user's messages */}
                        {!isOwnMessage && (
                          <div className="flex-shrink-0">
                            <Image
                              src={playerAvatar || "/default-avatar.png"}
                              alt={playerName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`px-4 py-3 rounded-2xl theme-transition shadow-sm ${
                            isOwnMessage
                              ? "bg-purple-600 dark:bg-green-600 text-white rounded-br-md"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 theme-transition ${
                              isOwnMessage
                                ? "text-purple-200 dark:text-green-200 text-right"
                                : "text-gray-500 dark:text-gray-400 text-left"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>

                        {/* Avatar for own messages */}
                        {isOwnMessage && (
                          <div className="flex-shrink-0">
                            <Image
                              src={user.avatar || "/default-avatar.png"}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Typing indicator */}
              {otherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-4"
                >
                  <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Image
                        src={playerAvatar || "/default-avatar.png"}
                        alt={playerName}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    </div>

                    {/* Typing bubble */}
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {playerName} is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 theme-transition">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white theme-transition placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-purple-600 dark:bg-green-600 text-white rounded-full hover:bg-purple-700 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 theme-transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
