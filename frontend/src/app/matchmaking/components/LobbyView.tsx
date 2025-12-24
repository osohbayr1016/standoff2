"use client";

import { motion, AnimatePresence } from "framer-motion";
import LobbyPlayerCard from "./LobbyPlayerCard";
import { X } from "lucide-react";

interface LobbyPlayer {
  userId: string;
  inGameName: string;
  standoff2Id?: string;
  elo: number;
  isReady: boolean;
}

interface LobbyViewProps {
  lobbyId: string;
  players: LobbyPlayer[];
  teamAlpha: string[];
  teamBravo: string[];
  currentUserId: string;
  allPlayersReady: boolean;
  onPlayerReady: () => void;
  onLeaveLobby: () => void;
  adminReadyAllButton?: React.ReactNode;
  countdownElement?: React.ReactNode;
  addResultButton?: React.ReactNode;
}

export default function LobbyView({
  lobbyId,
  players,
  teamAlpha,
  teamBravo,
  currentUserId,
  allPlayersReady,
  onPlayerReady,
  onLeaveLobby,
  adminReadyAllButton,
  countdownElement,
  addResultButton,
}: LobbyViewProps) {
  // Split players into teams
  const alphaPlayers = players.filter((p) =>
    teamAlpha.includes(p.userId.toString())
  );
  const bravoPlayers = players.filter((p) =>
    teamBravo.includes(p.userId.toString())
  );

  const readyCount = players.filter((p) => p.isReady).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] relative px-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-2"
        >
          Match Found!
        </motion.h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={`ready-${readyCount}-${allPlayersReady}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400 text-sm sm:text-base"
          >
            {allPlayersReady
              ? "All players ready! Copy IDs to join the game"
              : `Waiting for players to ready up (${readyCount}/10)`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Teams Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Team Alpha (Blue) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h2 className="text-xl font-bold text-blue-400">Team Alpha</h2>
          </div>
          <div className="space-y-2">
            {alphaPlayers.map((player, index) => (
              <LobbyPlayerCard
                key={player.userId}
                player={player}
                isCurrentUser={player.userId === currentUserId}
                allPlayersReady={allPlayersReady}
                onReady={onPlayerReady}
                teamColor="alpha"
              />
            ))}
          </div>
        </motion.div>

        {/* Team Bravo (Orange) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <h2 className="text-xl font-bold text-orange-400">Team Bravo</h2>
          </div>
          <div className="space-y-2">
            {bravoPlayers.map((player, index) => (
              <LobbyPlayerCard
                key={player.userId}
                player={player}
                isCurrentUser={player.userId === currentUserId}
                allPlayersReady={allPlayersReady}
                onReady={onPlayerReady}
                teamColor="bravo"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {!allPlayersReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={onLeaveLobby}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <X className="w-5 h-5" />
            Leave Lobby
          </button>
          {adminReadyAllButton}
        </motion.div>
      )}

      {/* All Ready Message with Countdown and Result Button */}
      {allPlayersReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col items-center"
        >
          {/* Countdown Timer */}
          {countdownElement}

          {/* All Players Ready Message */}
          <div className="p-6 bg-green-900/30 border-2 border-green-500 rounded-xl text-center">
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              All Players Ready!
            </h3>
            <p className="text-gray-300 text-sm">
              Copy the Standoff2 IDs above and join the game manually
            </p>
          </div>

          {/* Add Result Button */}
          {addResultButton && (
            <div className="mt-6">{addResultButton}</div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

