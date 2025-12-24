"use client";

import { motion } from "framer-motion";
import LobbyPlayerCard from "./LobbyPlayerCard";
import { Plus } from "lucide-react";

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
  leaderId: string;
  onJoinTeam: (team: "alpha" | "bravo") => void;
  onKick: (userId: string) => void;
  allPlayersReady: boolean;
  onPlayerReady: () => void;
  teamColor: "alpha" | "bravo";
}

export default function TeamColumn({
  teamName,
  teamPlayers,
  currentUserId,
  leaderId,
  onJoinTeam,
  onKick,
  allPlayersReady,
  onPlayerReady,
  teamColor,
}: TeamColumnProps) {
  const dotColor = teamColor === "alpha" ? "bg-blue-500" : "bg-orange-500";
  const textColor = teamColor === "alpha" ? "text-blue-400" : "text-orange-400";
  const xOffset = teamColor === "alpha" ? -50 : 50;

  // Fill up to 5 slots
  const slots = [...Array(5)].map((_, i) => teamPlayers[i] || null);

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-center gap-3 py-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
        <div className={`w-3 h-3 rounded-full ${dotColor} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
        <h2 className={`text-xl font-black uppercase tracking-tighter ${textColor}`}>{teamName}</h2>
        <span className="text-gray-500 font-bold text-sm">({teamPlayers.length}/5)</span>
      </div>
      
      <div className="space-y-3">
        {slots.map((player, i) => (
          player ? (
            <LobbyPlayerCard
              key={player.userId}
              player={player}
              isCurrentUser={player.userId === currentUserId}
              isLeader={player.userId === leaderId}
              canKick={currentUserId === leaderId}
              onKick={onKick}
              allPlayersReady={allPlayersReady}
              onReady={onPlayerReady}
              teamColor={teamColor}
            />
          ) : (
            <motion.button
              key={`empty-${i}`}
              onClick={() => onJoinTeam(teamColor)}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              className="w-full h-[62px] border-2 border-dashed border-gray-700/50 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-all group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Join Slot</span>
            </motion.button>
          )
        ))}
      </div>
    </motion.div>
  );
}
