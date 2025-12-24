"use client";

import { motion, AnimatePresence } from "framer-motion";
import LobbyPlayerCard from "./LobbyPlayerCard";
import TeamColumn from "./TeamColumn";
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

  // Determine team leaders (highest ELO from each team)
  const alphaLeader = [...alphaPlayers].sort((a, b) => b.elo - a.elo)[0];
  const bravoLeader = [...bravoPlayers].sort((a, b) => b.elo - a.elo)[0];

  const alphaTeamName = alphaLeader ? `Team ${alphaLeader.inGameName}` : "Team Alpha";
  const bravoTeamName = bravoLeader ? `Team ${bravoLeader.inGameName}` : "Team Bravo";

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
        <TeamColumn
          teamName={alphaTeamName}
          teamPlayers={alphaPlayers}
          currentUserId={currentUserId}
          allPlayersReady={allPlayersReady}
          onPlayerReady={onPlayerReady}
          teamColor="alpha"
        />
        <TeamColumn
          teamName={bravoTeamName}
          teamPlayers={bravoPlayers}
          currentUserId={currentUserId}
          allPlayersReady={allPlayersReady}
          onPlayerReady={onPlayerReady}
          teamColor="bravo"
        />
      </div>

      {/* Action Buttons */}
      {!allPlayersReady && adminReadyAllButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
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

