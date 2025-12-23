"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    standoff2Id?: string;
    elo?: number;
  };
  createdAt: Date;
}

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isProcessing: boolean;
}

export default function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  isProcessing,
}: FriendRequestCardProps) {
  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#1a1f2e] rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">
            {request.sender.name}
          </h4>
          <p className="text-gray-400 text-sm">
            {request.sender.standoff2Id || "No ID"}
          </p>
          {request.sender.elo && (
            <p className="text-orange-500 text-xs">ELO: {request.sender.elo}</p>
          )}
        </div>
      </div>

      <p className="text-gray-500 text-xs mb-3">{timeAgo(request.createdAt)}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request.id)}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          <Check className="w-4 h-4" />
          Accept
        </button>
        <button
          onClick={() => onDecline(request.id)}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          <X className="w-4 h-4" />
          Decline
        </button>
      </div>
    </motion.div>
  );
}

