"use client";

import { motion } from "framer-motion";
import LobbyPlayerCard from "./LobbyPlayerCard";
import { Plus, ArrowRightLeft } from "lucide-react";

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
  const borderColor = teamColor === "alpha" ? "border-blue-500/30" : "border-orange-500/30";
  const bgGlow = teamColor === "alpha" ? "shadow-blue-500/20" : "shadow-orange-500/20";
  const xOffset = teamColor === "alpha" ? -50 : 50;

  // Check if current user is on this team
  const isUserOnThisTeam = teamPlayers.some(p => p.userId === currentUserId);
  const teamIsFull = teamPlayers.length >= 5;

  // Fill up to 5 slots
  const slots = [...Array(5)].map((_, i) => teamPlayers[i] || null);

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className={`space-y-4 ${isUserOnThisTeam ? `ring-2 ${borderColor} ${bgGlow} shadow-xl` : ''} rounded-2xl p-4 transition-all duration-300`}
    >
      <div className={`flex items-center justify-center gap-3 py-3 bg-gray-800/30 rounded-xl border ${isUserOnThisTeam ? borderColor : 'border-gray-700/30'}`}>
        <div className={`w-3 h-3 rounded-full ${dotColor} shadow-[0_0_10px_rgba(255,255,255,0.2)] ${isUserOnThisTeam ? 'animate-pulse' : ''}`} />
        <h2 className={`text-xl font-black uppercase tracking-tighter ${textColor}`}>{teamName}</h2>
        <span className="text-gray-500 font-bold text-sm">({teamPlayers.length}/5)</span>
        {isUserOnThisTeam && (
          <span className="ml-2 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-[10px] font-bold uppercase">
            Your Team
          </span>
        )}
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
              disabled={teamIsFull}
              whileHover={!teamIsFull ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" } : {}}
              className={`w-full h-[62px] border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all group ${teamIsFull
                  ? 'border-gray-800/30 text-gray-700 cursor-not-allowed'
                  : 'border-gray-700/50 text-gray-500 hover:text-gray-300 hover:border-gray-500'
                }`}
            >
              {isUserOnThisTeam ? (
                <>
                  <ArrowRightLeft size={18} className="group-hover:rotate-180 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Switch Here</span>
                </>
              ) : (
                <>
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {teamIsFull ? 'Team Full' : 'Join Slot'}
                  </span>
                </>
              )}
            </motion.button>
          )
        ))}
      </div>
    </motion.div>
  );
}
