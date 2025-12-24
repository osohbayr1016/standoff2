"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, UserX } from "lucide-react";
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
  isLeader: boolean;
  canKick: boolean;
  onKick?: (userId: string) => void;
  allPlayersReady: boolean;
  onReady: () => void;
  teamColor: "alpha" | "bravo";
}

export default function LobbyPlayerCard({
  player,
  isCurrentUser,
  isLeader,
  canKick,
  onKick,
  allPlayersReady,
  onReady,
  teamColor,
}: LobbyPlayerCardProps) {
  const [copied, setCopied] = useState(false);
  const [kicking, setKicking] = useState(false);

  const handleCopyId = async () => {
    if (player.standoff2Id) {
      await navigator.clipboard.writeText(player.standoff2Id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKick = async () => {
    if (onKick && !kicking) {
      setKicking(true);
      await onKick(player.userId);
      setKicking(false);
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
      key={`${player.userId}-${player.isReady}`}
      initial={{ opacity: 0, x: teamColor === "alpha" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gradient-to-br ${bgColor} rounded-lg p-3 border ${borderColor} transition-all group`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-semibold text-sm truncate">
              {player.inGameName}
            </h4>
            {isLeader && (
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded uppercase">Leader</span>
            )}
          </div>
          <p className="text-gray-400 text-xs">ELO: {player.elo}</p>
        </div>

        <div className="flex items-center gap-2">
          {canKick && !isCurrentUser && (
            <button
              onClick={handleKick}
              disabled={kicking}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-all opacity-0 group-hover:opacity-100"
              title="Kick Player"
            >
              <UserX size={14} className={kicking ? "animate-pulse" : ""} />
            </button>
          )}

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
              <motion.button
                key={`ready-btn-${player.userId}-${player.isReady}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  backgroundColor: player.isReady 
                    ? "rgb(22, 163, 74)" // green-600
                    : isCurrentUser 
                    ? "rgb(234, 88, 12)" // orange-600
                    : "rgb(55, 65, 81)" // gray-700
                }}
                transition={{ duration: 0.3 }}
                onClick={onReady}
                disabled={!isCurrentUser || player.isReady}
                className={`px-3 py-1.5 rounded text-xs font-medium ${
                  player.isReady
                    ? "text-white cursor-default"
                    : isCurrentUser
                    ? "text-white hover:bg-orange-700"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <AnimatePresence mode="wait">
                  {player.isReady ? (
                    <motion.span
                      key="ready"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Ready
                    </motion.span>
                  ) : (
                    <motion.span
                      key="not-ready"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      Ready
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


