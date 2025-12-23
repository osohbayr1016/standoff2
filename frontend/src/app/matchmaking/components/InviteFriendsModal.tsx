"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../contexts/AuthContext";

interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: number;
  status: "online" | "offline" | "ingame";
  isInvited?: boolean;
}

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (friendId: string) => void;
}

export default function InviteFriendsModal({
  isOpen,
  onClose,
  onInvite,
}: InviteFriendsModalProps) {
  const { user, getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());

  const fetchPlayers = useCallback(async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.FRIENDS.ALL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const players = (data.friends || []).map((friend: any) => ({
          id: friend.userId || friend.id,
          username: friend.inGameName || friend.name || "Unknown",
          avatar: friend.avatar || "/default-avatar.png",
          level: friend.elo ? Math.floor(friend.elo / 100) : 1,
          status: friend.isOnline ? "online" : "offline",
        }));
        setFriends(players);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, getToken]);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
      setInvitedFriends(new Set());
    }
  }, [isOpen, fetchPlayers]);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (friendId: string) => {
    setInvitedFriends((prev) => new Set(prev).add(friendId));
    onInvite(friendId);
  };

  const getStatusColor = (status: Friend["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "ingame":
        return "bg-orange-500";
      case "offline":
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Friend["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "ingame":
        return "In Game";
      case "offline":
        return "Offline";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[600px] pointer-events-auto"
            >
              <div className="p-4 sm:p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    Invite Friends
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar sm:max-h-96">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <div className="text-center py-8 text-sm sm:text-base text-gray-500">
                      {searchQuery
                        ? "No friends found matching your search"
                        : "No friends yet. Add friends from the Friends page!"}
                    </div>
                  ) : (
                    filteredFriends.map((friend) => {
                      const isInvited = invitedFriends.has(friend.id);
                      return (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-[#1a1f2e] hover:bg-[#1f2535] rounded-lg p-3 sm:p-4 border border-gray-700/50 transition-colors gap-2"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="relative flex-shrink-0">
                              <Image
                                src={friend.avatar}
                                alt={friend.username}
                                width={40}
                                height={40}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-700"
                              />
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 ${getStatusColor(
                                  friend.status
                                )} rounded-full border-2 border-[#1a1f2e]`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm sm:text-base truncate">
                                {friend.username}
                              </p>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <p className="text-[10px] sm:text-xs text-gray-400">
                                  Level {friend.level}
                                </p>
                                <span className="text-gray-600 text-xs">•</span>
                                <p className="text-[10px] sm:text-xs text-gray-400">
                                  {getStatusText(friend.status)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleInvite(friend.id)}
                            disabled={
                              isInvited ||
                              friend.status === "ingame" ||
                              friend.status === "offline"
                            }
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0 ${
                              isInvited
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : friend.status === "offline"
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : friend.status === "ingame"
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-orange-600 hover:bg-orange-700 text-white"
                            }`}
                          >
                            {isInvited ? (
                              <>
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">
                                  Pending
                                </span>
                              </>
                            ) : friend.status === "offline" ? (
                              <span className="text-xs">Offline</span>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Invite</span>
                              </>
                            )}
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #1a1f2e;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #374151;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #4b5563;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
