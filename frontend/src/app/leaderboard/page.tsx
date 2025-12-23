"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "../../config/api";

interface LeaderboardPlayer {
  _id: string;
  userId: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
  region?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PLAYER_PROFILES.ALL}?limit=100`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success && data.profiles) {
        // Transform profiles to leaderboard format using real data
        const normalizeId = (val: any): string | undefined => {
          if (!val) return undefined;
          if (typeof val === "string") return val;
          if (typeof val === "object") {
            if (val._id) return String(val._id);
            // Avoid returning "[object Object]"
            const strVal = val.toString();
            if (strVal && strVal !== "[object Object]") return strVal;
          }
          return undefined;
        };

        const players = data.profiles
          .map((profile: any) => {
            // Prioritize uniqueId for navigation, fall back to userId or _id
            const profileId =
              profile.uniqueId ||
              normalizeId(profile.userId) ||
              String(profile._id || profile.id);

            return {
              _id: String(profile._id || profile.id),
              userId: profileId, // Use uniqueId when available, else normalized userId/_id
              name: profile.inGameName || profile.name || "Unknown Player",
              elo: profile.elo || profile.rankStars || 1000,
              wins: profile.wins || 0,
              losses: profile.losses || 0,
              winRate: 0,
              region: profile.region || "Global",
            };
          })
          .map((player: LeaderboardPlayer) => ({
            ...player,
            winRate:
              player.wins + player.losses > 0
                ? Math.round(
                    (player.wins / (player.wins + player.losses)) * 100
                  )
                : 0,
          }))
          .sort((a: LeaderboardPlayer, b: LeaderboardPlayer) => b.elo - a.elo);

        setLeaderboardData(players);
      } else {
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0)
      return { icon: "🥇", color: "bg-yellow-500/20 border-yellow-500" };
    if (index === 1)
      return { icon: "🥈", color: "bg-gray-400/20 border-gray-400" };
    if (index === 2)
      return { icon: "🥉", color: "bg-orange-600/20 border-orange-600" };
    return { icon: `${index + 1}`, color: "bg-gray-800 border-gray-700" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900/50 to-gray-900/50 border-b border-orange-500/30 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Top players ranked by ELO
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 bg-gray-900/50 border-b border-gray-700 text-xs md:text-sm font-semibold text-gray-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-8">Player</div>
            <div className="col-span-3 text-center">ELO</div>
          </div>

          {/* Mobile Table Header */}
          <div className="md:hidden grid grid-cols-3 gap-2 px-3 py-3 bg-gray-900/50 border-b border-gray-700 text-xs font-semibold text-gray-400">
            <div>Rank</div>
            <div>Player</div>
            <div className="text-center">ELO</div>
          </div>

          {/* Empty State */}
          {leaderboardData.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">No players found</p>
              <p className="text-gray-500 text-sm mt-2">
                Be the first to join the leaderboard!
              </p>
            </div>
          )}

          {/* Table Rows */}
          {leaderboardData.map((player, index) => {
            const rankBadge = getRankBadge(index);
            return (
              <div key={player._id}>
                {/* Desktop Layout */}
                <div
                  onClick={() => router.push(`/profile/${player.userId}`)}
                  className={`hidden md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                    index < 3 ? rankBadge.color : ""
                  }`}
                >
                  <div className="col-span-1 flex items-center">
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${rankBadge.color} border-2 flex items-center justify-center font-bold text-white text-xs md:text-sm`}
                    >
                      {rankBadge.icon}
                    </div>
                  </div>
                  <div className="col-span-8 flex items-center">
                    <span className="text-white font-medium text-sm md:text-base truncate">
                      {player.name}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-center">
                    <span className="text-orange-500 font-bold text-sm md:text-base">
                      {player.elo}
                    </span>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div
                  onClick={() => router.push(`/profile/${player.userId}`)}
                  className={`md:hidden grid grid-cols-3 gap-2 px-3 py-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                    index < 3 ? rankBadge.color : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${rankBadge.color} border-2 flex items-center justify-center font-bold text-white text-xs`}
                    >
                      {rankBadge.icon}
                    </div>
                  </div>
                  <div className="flex items-center min-w-0">
                    <span className="text-white font-medium text-sm truncate">
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-orange-500 font-bold text-sm">
                      {player.elo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
