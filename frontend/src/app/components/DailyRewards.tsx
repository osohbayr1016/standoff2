"use client";

import { motion } from "framer-motion";
import { Gift, Check, Lock, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

interface DailyRewardData {
  lastClaimDate: string | null;
  currentStreak: number;
  claimedDays: number[];
}

const REWARD_CONFIG = [
  { day: 1, coins: 50 },
  { day: 2, coins: 75 },
  { day: 3, coins: 100 },
  { day: 4, coins: 150 },
  { day: 5, coins: 200 },
  { day: 6, coins: 300 },
  { day: 7, coins: 500 },
];

const STORAGE_KEY = "daily_rewards_data";

export default function DailyRewards() {
  const { user, getToken } = useAuth();
  const [rewardData, setRewardData] = useState<DailyRewardData>({
    lastClaimDate: null,
    currentStreak: 0,
    claimedDays: [],
  });
  const [isClaiming, setIsClaiming] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);

  const fetchCoinBalance = useCallback(async () => {
    if (!user) return;
    try {
      const token = getToken();
      const response = await fetch(
        API_ENDPOINTS.BOUNTY_COINS.BALANCE(user.id),
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.ok) {
        const data = await response.json();
        setCoinBalance(data.balance || 0);
      }
    } catch {
      // Silently fail - balance display is optional
    }
  }, [user, getToken]);

  useEffect(() => {
    if (!user) return;

    const userStorageKey = `${STORAGE_KEY}_${user.id}`;
    const stored = localStorage.getItem(userStorageKey);

    if (stored) {
      const data: DailyRewardData = JSON.parse(stored);
      const today = new Date().toDateString();
      const lastClaim = data.lastClaimDate
        ? new Date(data.lastClaimDate).toDateString()
        : null;

      if (lastClaim === today) {
        setRewardData(data);
      } else if (lastClaim) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastClaim === yesterdayStr) {
          setRewardData(data);
        } else {
          resetStreak(userStorageKey);
        }
      } else {
        setRewardData(data);
      }
    }

    fetchCoinBalance();
  }, [user, fetchCoinBalance]);

  const resetStreak = (storageKey: string) => {
    const resetData: DailyRewardData = {
      lastClaimDate: null,
      currentStreak: 0,
      claimedDays: [],
    };
    localStorage.setItem(storageKey, JSON.stringify(resetData));
    setRewardData(resetData);
  };

  const handleClaimReward = async () => {
    if (!user || isClaiming || alreadyClaimedToday) return;

    const today = new Date().toDateString();
    const userStorageKey = `${STORAGE_KEY}_${user.id}`;
    const stored = localStorage.getItem(userStorageKey);
    let data: DailyRewardData = stored
      ? JSON.parse(stored)
      : { lastClaimDate: null, currentStreak: 0, claimedDays: [] };

    setIsClaiming(true);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    const lastClaim = data.lastClaimDate
      ? new Date(data.lastClaimDate).toDateString()
      : null;

    if (data.currentStreak === 7 && data.claimedDays.length === 7) {
      data.currentStreak = 0;
      data.claimedDays = [];
    }

    if (lastClaim === yesterdayStr) {
      data.currentStreak = Math.min(data.currentStreak + 1, 7);
    } else if (lastClaim && lastClaim !== yesterdayStr) {
      data.currentStreak = 1;
      data.claimedDays = [];
    } else {
      data.currentStreak = 1;
    }

    const dayToClaim = Math.min(data.currentStreak, 7);
    const rewardCoins = REWARD_CONFIG[dayToClaim - 1]?.coins || 50;

    if (!data.claimedDays.includes(dayToClaim)) {
      data.claimedDays.push(dayToClaim);
    }

    data.lastClaimDate = today;
    localStorage.setItem(userStorageKey, JSON.stringify(data));
    setRewardData(data);

    // Update coin balance locally
    if (coinBalance !== null) {
      setCoinBalance((prev) => (prev || 0) + rewardCoins);
    }

    setTimeout(() => setIsClaiming(false), 500);
  };

  const today = new Date().toDateString();
  const lastClaim = rewardData.lastClaimDate
    ? new Date(rewardData.lastClaimDate).toDateString()
    : null;
  const alreadyClaimedToday = lastClaim === today;

  const getRewardStatus = (day: number) => {
    if (rewardData.claimedDays.includes(day)) {
      return { completed: true, current: false };
    }
    const nextDay = rewardData.currentStreak + 1;
    if (day === nextDay && !alreadyClaimedToday) {
      return { completed: false, current: true };
    }
    return { completed: false, current: false };
  };

  const rewards = REWARD_CONFIG.map((config) => ({
    ...config,
    ...getRewardStatus(config.day),
  }));

  const completedDays = rewardData.claimedDays.length;
  const totalDays = REWARD_CONFIG.length;
  const progress = (completedDays / totalDays) * 100;

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-[#1a1d29] to-[#0f1419] rounded-2xl border border-orange-500/20 p-6">
        <p className="text-center text-gray-400">
          Please log in to claim daily rewards
        </p>
      </div>
    );
  }

  const currentReward = rewards.find((r) => r.current);
  const nextRewardCoins = currentReward?.coins || 0;

  return (
    <div className="bg-gradient-to-br from-[#1a1d29] to-[#0f1419] rounded-2xl border border-orange-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Daily Rewards</h3>
            <p className="text-sm text-gray-400">
              {completedDays} / {totalDays} days • Streak:{" "}
              {rewardData.currentStreak}
              {coinBalance !== null && ` • ${coinBalance} coins`}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-orange-600 to-orange-500"
          />
        </div>
        <div className="absolute -top-1 right-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {rewards.map((reward, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 ${
              reward.completed
                ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/50"
                : reward.current
                ? "bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-2 border-orange-500 shadow-lg shadow-orange-500/20 animate-pulse"
                : "bg-[#1a1d29]/50 border border-gray-700/30"
            }`}
          >
            <div className="text-center">
              {reward.completed ? (
                <Check className="w-5 h-5 text-green-500 mx-auto mb-1" />
              ) : reward.current ? (
                <Gift className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              )}
              <div
                className={`text-xs font-bold ${
                  reward.completed
                    ? "text-green-500"
                    : reward.current
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {reward.coins}
              </div>
            </div>
            <div
              className={`absolute -bottom-5 text-xs ${
                reward.completed || reward.current
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              D{reward.day}
            </div>
          </motion.div>
        ))}
      </div>

      {currentReward && !alreadyClaimedToday && (
        <motion.button
          onClick={handleClaimReward}
          disabled={isClaiming || alreadyClaimedToday}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 mb-4 flex items-center justify-center gap-2"
        >
          {isClaiming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Claiming...
            </>
          ) : (
            `Claim Day ${
              rewardData.currentStreak + 1
            } Reward (+${nextRewardCoins} coins)`
          )}
        </motion.button>
      )}

      {alreadyClaimedToday && (
        <div className="w-full bg-green-600/20 border border-green-500/50 text-green-400 font-medium py-3 rounded-lg text-center mb-4">
          ✓ Reward claimed today! Come back tomorrow
        </div>
      )}

      <div className="pt-4 border-t border-gray-800/50">
        <p className="text-center text-sm text-gray-400">
          {alreadyClaimedToday
            ? "Great job! Your streak continues tomorrow."
            : "Claim your daily reward to continue your streak!"}
        </p>
      </div>
    </div>
  );
}
