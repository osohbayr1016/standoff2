"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";

interface Player {
  rank: number;
  name: string;
  avatar: string;
  points: number;
}

export default function LiveLeaderboardTop5() {
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPlayers();
  }, []);

  const fetchTopPlayers = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PLAYER_PROFILES.ALL}?limit=5`
      );
      const data = await response.json();

      if (data.success && data.profiles) {
        const players = data.profiles
          .map((profile: any, index: number) => ({
            rank: index + 1,
            name: profile.inGameName || profile.name || "Unknown",
            avatar: profile.avatar || "/default-avatar.png",
            points: profile.elo || profile.rankStars || 1000,
          }))
          .sort((a: Player, b: Player) => b.points - a.points)
          .slice(0, 5)
          .map((p: Player, i: number) => ({ ...p, rank: i + 1 }));

        setTopPlayers(players);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        icon: "🥇",
        bg: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10",
        border: "border-yellow-500/30",
      };
    if (rank === 2)
      return {
        icon: "🥈",
        bg: "bg-gradient-to-r from-gray-400/20 to-gray-500/10",
        border: "border-gray-400/30",
      };
    if (rank === 3)
      return {
        icon: "🥉",
        bg: "bg-gradient-to-r from-orange-600/20 to-orange-700/10",
        border: "border-orange-600/30",
      };
    return {
      icon: `#${rank}`,
      bg: "bg-[#1a1d29]/50",
      border: "border-gray-700/30",
    };
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Top Players</h3>
        </div>
        <Link
          href="/leaderboard"
          className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
        >
          View All →
        </Link>
      </div>

      {topPlayers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No players yet</p>
          <p className="text-gray-500 text-sm">Be the first to join!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topPlayers.map((player, index) => {
            const rankStyle = getRankStyle(player.rank);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`flex items-center justify-between p-4 rounded-xl ${rankStyle.bg} border ${rankStyle.border} transition-all duration-300`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{rankStyle.icon}</div>
                  <Image
                    src={player.avatar}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-orange-500/20"
                  />
                  <span className="text-white font-semibold">
                    {player.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-orange-500 font-bold text-lg">
                    {player.points}
                  </div>
                  <div className="text-gray-500 text-xs">ELO</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
