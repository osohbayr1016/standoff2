"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { History, Inbox } from "lucide-react";

interface MatchHistoryItem {
  id: string;
  opponent: {
    name: string;
    avatar: string;
    tag?: string;
  };
  mapPlayed: string;
  eloChange: number;
}

interface MatchHistoryProps {
  matches: MatchHistoryItem[];
}

export default function MatchHistory({ matches }: MatchHistoryProps) {
  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Recent Match History</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg font-medium mb-2">
            No matches yet
          </p>
          <p className="text-gray-600 text-sm text-center max-w-xs">
            Play your first match to see your match history here
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Recent Match History</h3>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
        <span>Match</span>
        <span className="text-center">Map Played</span>
        <span className="text-right">ELO</span>
      </div>

      {/* Match List */}
      <div className="divide-y divide-gray-700/30 max-h-[400px] overflow-y-auto">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="grid grid-cols-3 gap-4 items-center px-4 py-3 hover:bg-gray-800/30 transition-colors"
          >
            {/* Opponent */}
            <div className="flex items-center gap-3">
              <Image
                src={match.opponent.avatar}
                alt={match.opponent.name}
                width={36}
                height={36}
                className="rounded-full border border-gray-700"
              />
              <div>
                <p className="text-white font-medium text-sm">
                  {match.opponent.name}
                </p>
                {match.opponent.tag && (
                  <p className="text-gray-500 text-xs">{match.opponent.tag}</p>
                )}
              </div>
            </div>

            {/* Map */}
            <p className="text-gray-400 text-sm text-center">
              {match.mapPlayed}
            </p>

            {/* ELO Change */}
            <p
              className={`text-right font-bold text-sm ${
                match.eloChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {match.eloChange >= 0 ? `+${match.eloChange}` : match.eloChange}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
