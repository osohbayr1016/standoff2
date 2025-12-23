"use client";

import { motion } from "framer-motion";

interface FriendCardProps {
  friend: {
    id: string;
    userId: string;
    name: string;
    inGameName: string;
    standoff2Id?: string;
    avatar?: string;
    elo: number;
    isOnline: boolean;
    wins?: number;
    losses?: number;
  };
  onMessage: (friendId: string) => void;
}

export default function FriendCard({ friend, onMessage }: FriendCardProps) {
  const totalMatches = (friend.wins || 0) + (friend.losses || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">
            {friend.inGameName}
          </h3>
          <p className="text-gray-400 text-sm">
            {friend.standoff2Id || "ID not set"}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-orange-500 font-medium text-sm">
              ELO: {friend.elo}
            </span>
            {totalMatches > 0 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-xs">
                  {friend.wins}W - {friend.losses}L
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <span
          className={`text-sm ${
            friend.isOnline ? "text-green-400" : "text-gray-500"
          }`}
        >
          {friend.isOnline ? "● online" : "● offline"}
        </span>
      </div>
    </motion.div>
  );
}

