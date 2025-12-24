"use client";

import { motion } from "framer-motion";
import LobbyPlayerCard from "./LobbyPlayerCard";

interface LobbyPlayer {
  userId: string;
  inGameName: string;
  standoff2Id?: string;
  elo: number;
  isReady: boolean;
}

interface TeamColumnProps {
  teamName: string;
  teamPlayers: LobbyPlayer[];
  currentUserId: string;
  allPlayersReady: boolean;
  onPlayerReady: () => void;
  teamColor: "alpha" | "bravo";
}

export default function TeamColumn({
  teamName,
  teamPlayers,
  currentUserId,
  allPlayersReady,
  onPlayerReady,
  teamColor,
}: TeamColumnProps) {
  const dotColor = teamColor === "alpha" ? "bg-blue-500" : "bg-orange-500";
  const textColor = teamColor === "alpha" ? "text-blue-400" : "text-orange-400";
  const xOffset = teamColor === "alpha" ? -50 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
        <h2 className={`text-xl font-bold ${textColor}`}>{teamName}</h2>
      </div>
      <div className="space-y-2">
        {teamPlayers.map((player) => (
          <LobbyPlayerCard
            key={player.userId}
            player={player}
            isCurrentUser={player.userId === currentUserId}
            allPlayersReady={allPlayersReady}
            onReady={onPlayerReady}
            teamColor={teamColor}
          />
        ))}
      </div>
    </motion.div>
  );
}

