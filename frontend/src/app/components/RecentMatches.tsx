"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Swords, Inbox, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

interface Match {
  id: string;
  player1: string;
  player1Avatar: string;
  player2: string;
  player2Avatar: string;
  score: string;
  result: "win" | "loss" | "draw";
  time: string;
}

export default function RecentMatches() {
  const { user, getToken } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.MATCHES.HISTORY, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        const formattedMatches = (data.matches || [])
          .slice(0, 5)
          .map((match: any) => ({
            id: match._id || match.id,
            player1: match.challengerName || "You",
            player1Avatar: match.challengerAvatar || "/default-avatar.png",
            player2: match.opponentName || "Opponent",
            player2Avatar: match.opponentAvatar || "/default-avatar.png",
            score: `${match.challengerScore || 0} - ${
              match.opponentScore || 0
            }`,
            result: match.result || "draw",
            time: formatTime(match.completedAt || match.createdAt),
          }));
        setMatches(formattedMatches);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getResultStyle = (result: string) => {
    if (result === "win") return "text-green-500 bg-green-500/10";
    if (result === "loss") return "text-red-500 bg-red-500/10";
    return "text-gray-400 bg-gray-500/10";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1d29] to-[#0f1419] rounded-2xl border border-orange-500/20 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1d29] to-[#0f1419] rounded-2xl border border-orange-500/20 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
          <Swords className="w-5 h-5 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Recent Matches</h3>
      </div>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg font-medium mb-2">
            No matches yet
          </p>
          <p className="text-gray-600 text-sm text-center max-w-xs">
            {user
              ? "Play your first match to see your match history here"
              : "Log in to see your match history"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1a1d29]/50 border border-gray-700/30 rounded-xl p-4 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Image
                    src={match.player1Avatar}
                    alt={match.player1}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-orange-500/20"
                  />
                  <span className="text-white font-semibold">
                    {match.player1}
                  </span>
                </div>

                <div
                  className={`px-4 py-1 rounded-lg font-bold ${getResultStyle(
                    match.result
                  )}`}
                >
                  {match.score}
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold">
                    {match.player2}
                  </span>
                  <Image
                    src={match.player2Avatar}
                    alt={match.player2}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-orange-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>{match.time}</span>
                <span className="uppercase">{match.result}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
