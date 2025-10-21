"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Award, Users, Medal, Crown } from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";
import Link from "next/link";

interface Squad {
  _id: string;
  name: string;
  tag: string;
  logo?: string;
  matchStats: {
    wins: number;
    losses: number;
    draws: number;
    totalMatches: number;
    winRate: number;
    totalEarned: number;
  };
  currentBountyCoins: number;
  members: any[];
  leader: {
    _id: string;
    name: string;
  };
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"wins" | "winRate" | "totalEarned">(
    "wins"
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.SQUADS}?limit=100`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        // Filter squads with match stats
        const squadsWithMatches = data.data.filter(
          (s: Squad) => s.matchStats && s.matchStats.totalMatches > 0
        );

        // Sort by selected criteria
        const sorted = squadsWithMatches.sort((a: Squad, b: Squad) => {
          switch (sortBy) {
            case "wins":
              if (b.matchStats.wins !== a.matchStats.wins) {
                return b.matchStats.wins - a.matchStats.wins;
              }
              return b.matchStats.winRate - a.matchStats.winRate;
            case "winRate":
              if (b.matchStats.winRate !== a.matchStats.winRate) {
                return b.matchStats.winRate - a.matchStats.winRate;
              }
              return b.matchStats.wins - a.matchStats.wins;
            case "totalEarned":
              return b.matchStats.totalEarned - a.matchStats.totalEarned;
            default:
              return 0;
          }
        });

        setLeaderboard(sorted);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 2:
        return <Medal className="w-8 h-8 text-amber-600" />;
      default:
        return (
          <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
        );
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400/20 to-yellow-600/20 border-yellow-400/30";
      case 1:
        return "from-gray-300/20 to-gray-500/20 border-gray-300/30";
      case 2:
        return "from-amber-400/20 to-amber-600/20 border-amber-400/30";
      default:
        return "from-gray-700/50 to-gray-800/50 border-gray-600/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8">
            <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-gray-400 text-center py-8">Уншиж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Leaderboard
            </h1>

            {/* Sort Options */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("wins")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "wins"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Ялалт
              </button>
              <button
                onClick={() => setSortBy("winRate")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "winRate"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Win Rate
              </button>
              <button
                onClick={() => setSortBy("totalEarned")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "totalEarned"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Олсон мөнгө
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">Тоглолт байхгүй байна</p>
              <p className="text-gray-500 text-sm mt-2">
                Squad-ууд тоглолт хийхэд leaderboard харагдана
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((squad, index) => (
                <Link
                  key={squad._id}
                  href={`/squads/${squad._id}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-gradient-to-r ${getRankColor(
                      index
                    )} border rounded-xl p-6 hover:scale-[1.02] transition-all group`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(index)}
                        </div>

                        {/* Squad Info */}
                        <div className="flex items-center gap-4">
                          {squad.logo && (
                            <img
                              src={squad.logo}
                              alt={squad.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
                              {squad.name}
                            </p>
                            <p className="text-gray-400">[{squad.tag}]</p>
                            <p className="text-gray-500 text-sm">
                              {squad.members.length} гишүүн •{" "}
                              {squad.leader.name} (Leader)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-green-500 font-bold text-xl">
                            {squad.matchStats.wins}
                          </p>
                          <p className="text-gray-400 text-sm">Ялалт</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-500 font-bold text-xl">
                            {squad.matchStats.losses}
                          </p>
                          <p className="text-gray-400 text-sm">Хожигдол</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-400 font-bold text-xl">
                            {squad.matchStats.winRate.toFixed(1)}%
                          </p>
                          <p className="text-gray-400 text-sm">Win Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-yellow-400 font-bold text-xl">
                            {squad.matchStats.totalEarned.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">Олсон мөнгө</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-400 font-bold text-xl">
                            {squad.currentBountyCoins.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">Bounty Coin</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {sortBy === "wins" && "Ялалтын тоогоор эрэмбэлэгдсэн"}
                  {sortBy === "winRate" && "Win rate-аар эрэмбэлэгдсэн"}
                  {sortBy === "totalEarned" && "Олсон мөнгөөр эрэмбэлэгдсэн"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{leaderboard.length} squad</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
