"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface LobbyPlayerCardProps {
  player: {
    userId: string;
    inGameName: string;
    standoff2Id?: string;
    elo: number;
    isReady: boolean;
  };
  isCurrentUser: boolean;
  allPlayersReady: boolean;
  onReady: () => void;
  teamColor: "alpha" | "bravo";
}

export default function LobbyPlayerCard({
  player,
  isCurrentUser,
  allPlayersReady,
  onReady,
  teamColor,
}: LobbyPlayerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (player.standoff2Id) {
      await navigator.clipboard.writeText(player.standoff2Id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const bgColor =
    teamColor === "alpha"
      ? "from-blue-900/40 to-blue-950/60"
      : "from-orange-900/40 to-orange-950/60";

  const borderColor =
    teamColor === "alpha" ? "border-blue-500/50" : "border-orange-500/50";

  return (
    <motion.div
      initial={{ opacity: 0, x: teamColor === "alpha" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gradient-to-br ${bgColor} rounded-lg p-3 border ${borderColor} transition-all`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">
            {player.inGameName}
          </h4>
          <p className="text-gray-400 text-xs">ELO: {player.elo}</p>
        </div>

        <div className="flex-shrink-0">
          {allPlayersReady ? (
            // Show copyable ID when all ready
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-mono">
                {player.standoff2Id || "No ID"}
              </span>
              {player.standoff2Id && (
                <button
                  onClick={handleCopyId}
                  className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Copy ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </button>
              )}
            </div>
          ) : (
            // Show ready button/status
            <button
              onClick={onReady}
              disabled={!isCurrentUser || player.isReady}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                player.isReady
                  ? "bg-green-600 text-white cursor-default"
                  : isCurrentUser
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {player.isReady ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Ready
                </span>
              ) : (
                "Ready"
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

