"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Gift, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

interface Badge {
  id: string;
  name: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  description: string;
}

interface RewardData {
  lastClaimDate: string | null;
  currentStreak: number;
  claimedDays: number[];
}

const STORAGE_KEY = "daily_rewards_data";

export default function RewardsPage() {
  const { user, getToken } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardData, setRewardData] = useState<RewardData>({
    lastClaimDate: null,
    currentStreak: 0,
    claimedDays: [],
  });

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = getToken();

      // Fetch badges
      const badgesRes = await fetch(API_ENDPOINTS.ACHIEVEMENTS.MY_BADGES, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);

      if (badgesRes?.ok) {
        const data = await badgesRes.json();
        const formattedBadges = (data.badges || []).map((badge: any) => ({
          id: badge._id || badge.id,
          name: badge.name || "Badge",
          icon: badge.icon || "🏆",
          progress: badge.progress || (badge.earned ? 1 : 0),
          maxProgress: 1,
          unlocked: badge.earned !== false,
          description: badge.description || "Complete tasks to unlock",
        }));
        setBadges(formattedBadges);
      }

      // Load daily rewards from localStorage
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        setRewardData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dailyLoginDays = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
    day,
    completed: rewardData.claimedDays.includes(day),
  }));

  const dailyProgress = rewardData.claimedDays.length;
  const maxDailyRewards = 7;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#0f1117] to-black pt-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#0f1117] to-black pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Please log in to view your rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#0f1117] to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Rewards</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Login Rewards */}
          <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              Daily Login Rewards
            </h2>

            <div className="grid grid-cols-7 gap-3 mb-8">
              {dailyLoginDays.map((day) => (
                <div
                  key={day.day}
                  className="flex flex-col items-center space-y-2"
                >
                  <span className="text-sm text-gray-400">{day.day}</span>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      day.completed
                        ? "bg-orange-900/30 border-2 border-orange-500"
                        : "bg-gray-800/50 border-2 border-gray-700"
                    }`}
                  >
                    {day.completed ? (
                      <Check className="w-6 h-6 text-orange-500" />
                    ) : (
                      <Gift className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">Day</span>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Gift className="w-6 h-6 text-orange-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    Daily Rewards
                  </span>
                  <span className="text-sm font-bold text-white">
                    {dailyProgress} / {maxDailyRewards}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(dailyProgress / maxDailyRewards) * 100}%`,
                    }}
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                  />
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              Streak: {rewardData.currentStreak} day
              {rewardData.currentStreak !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Achievement Rewards */}
          <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              Achievement Rewards
            </h2>

            {badges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No badges yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Complete achievements to earn badges
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative rounded-xl p-4 border transition-all hover:scale-105 ${
                      badge.unlocked
                        ? "bg-orange-900/20 border-orange-500/50"
                        : badge.progress === 0
                        ? "bg-gray-800/30 border-gray-700/50"
                        : "bg-[#252840] border-gray-700/50"
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      {badge.progress === 0 ? (
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <div className="text-5xl filter grayscale opacity-30">
                            🏆
                          </div>
                          <Lock className="absolute w-8 h-8 text-gray-600" />
                        </div>
                      ) : (
                        <div className="text-5xl">{badge.icon}</div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            badge.unlocked ? "bg-orange-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${badge.progress * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 line-clamp-2">
                      {badge.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
