"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  Send,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import ChatModal from "../components/ChatModal";
import { API_ENDPOINTS } from "../../config/api";
import Image from "next/image";

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: {
    content: string;
    createdAt: string;
    isOwnMessage: boolean;
  } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<{
    playerId: string;
    playerName: string;
    playerAvatar?: string;
  } | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(API_ENDPOINTS.MESSAGES.CONVERSATIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      fetchConversations();
    }
  }, [user, authLoading, router]);

  // Filter conversations by search term
  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const handleChatClose = () => {
    setSelectedChat(null);
    // Refresh conversations to update unread counts
    fetchConversations();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Messages</h1>
                  <p className="text-gray-400 text-sm">
                    {conversations.length} conversation
                    {conversations.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>

          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  {searchTerm ? "No conversations found" : "No messages yet"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm
                    ? "Try a different search term"
                    : "Start a conversation from the players page"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => router.push("/players")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                  >
                    Find Players
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {filteredConversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      setSelectedChat({
                        playerId: conversation.userId,
                        playerName: conversation.userName,
                        playerAvatar: conversation.userAvatar,
                      })
                    }
                    className="p-4 hover:bg-gray-700/30 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Image
                          src={conversation.userAvatar || "/default-avatar.png"}
                          alt={conversation.userName}
                          width={56}
                          height={56}
                          className="rounded-full object-cover"
                        />
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {conversation.unreadCount > 9
                                ? "9+"
                                : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`font-semibold truncate ${
                              conversation.unreadCount > 0
                                ? "text-white"
                                : "text-gray-300"
                            }`}
                          >
                            {conversation.userName}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        {conversation.lastMessage && (
                          <div className="flex items-center space-x-2">
                            {conversation.lastMessage.isOwnMessage && (
                              <CheckCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <p
                              className={`text-sm truncate ${
                                conversation.unreadCount > 0
                                  ? "text-gray-300 font-medium"
                                  : "text-gray-400"
                              }`}
                            >
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Send Icon on Hover */}
                      <Send className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Chat Modal */}
      {selectedChat && (
        <ChatModal
          isOpen={true}
          onClose={handleChatClose}
          playerId={selectedChat.playerId}
          playerName={selectedChat.playerName}
          playerAvatar={selectedChat.playerAvatar}
        />
      )}
    </div>
  );
}
