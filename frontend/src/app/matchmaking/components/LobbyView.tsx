"use client";

import { motion, AnimatePresence } from "framer-motion";
import TeamColumn from "./TeamColumn";
import { Link as LinkIcon, Map as MapIcon, Users, Shield, Copy, Check, UserPlus } from "lucide-react";
import { useState } from "react";

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
  leaderId: string;
  selectedMap: string;
  lobbyLink: string;
  allPlayersReady: boolean;
  onPlayerReady: () => void;
  onJoinTeam: (team: "alpha" | "bravo") => void;
  onKick: (userId: string) => void;
  onInviteOpen: () => void;
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
  leaderId,
  selectedMap,
  lobbyLink,
  allPlayersReady,
  onPlayerReady,
  onJoinTeam,
  onKick,
  onInviteOpen,
  adminReadyAllButton,
  countdownElement,
  addResultButton,
}: LobbyViewProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  // Split players into teams based on their presence in teamAlpha/teamBravo arrays
  const alphaPlayers = players.filter((p) => teamAlpha.includes(p.userId));
  const bravoPlayers = players.filter((p) => teamBravo.includes(p.userId));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(lobbyLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const isLeader = currentUserId === leaderId;
  const readyCount = players.filter((p) => p.isReady).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] relative px-4"
    >
      {/* Lobby Info Bar */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#1e2433]/80 backdrop-blur-md border border-gray-700/50 p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MapIcon className="text-orange-500" size={20} />
            <span className="text-white font-black uppercase tracking-wider">{selectedMap}</span>
          </div>
          <div className="h-4 w-px bg-gray-700" />
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={18} />
            <span className="font-bold">{players.length}/10 Players</span>
          </div>
          <button
            onClick={onInviteOpen}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl border border-blue-500/20 transition-all font-bold text-xs uppercase"
          >
            <UserPlus size={14} /> Invite Friends
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#161b28] px-4 py-2 rounded-xl border border-gray-700">
            <LinkIcon className="text-gray-500" size={16} />
            <span className="text-gray-300 text-xs font-mono max-w-[200px] truncate">{lobbyLink}</span>
            <button 
              onClick={handleCopyLink}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              {linkCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          {isLeader && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Shield size={14} className="text-yellow-500" />
              <span className="text-yellow-500 text-[10px] font-black uppercase">Host</span>
            </div>
          )}
        </div>
      </div>


      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight"
        >
          LOBBY <span className="text-orange-500">PREPARATION</span>
        </motion.h1>
        <p className="text-gray-400 font-medium">
          {allPlayersReady
            ? "Everyone is ready! Good luck in the match."
            : `Joining teams and getting ready (${readyCount}/10)`}
        </p>
      </div>

      {/* Teams Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <TeamColumn
          teamName="Team Alpha"
          teamPlayers={alphaPlayers}
          currentUserId={currentUserId}
          leaderId={leaderId}
          onJoinTeam={onJoinTeam}
          onKick={onKick}
          allPlayersReady={allPlayersReady}
          onPlayerReady={onPlayerReady}
          teamColor="alpha"
        />
        <TeamColumn
          teamName="Team Bravo"
          teamPlayers={bravoPlayers}
          currentUserId={currentUserId}
          leaderId={leaderId}
          onJoinTeam={onJoinTeam}
          onKick={onKick}
          allPlayersReady={allPlayersReady}
          onPlayerReady={onPlayerReady}
          teamColor="bravo"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col items-center gap-6">
        {adminReadyAllButton}
        {countdownElement}
        {addResultButton}
      </div>
    </motion.div>
  );
}
