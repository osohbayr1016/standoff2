"use client";

import { motion } from "framer-motion";
import { Award, Gift, ChevronRight } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

interface AchievementRewardsProps {
  badges: Badge[];
}

export default function AchievementRewards({
  badges,
}: AchievementRewardsProps) {
  const earnedBadges = badges.filter((b) => b.earned);
  const upcomingBadges = badges.filter((b) => !b.earned).slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
          <Award className="w-5 h-5 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Achievement Rewards</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earned Badges */}
        <div>
          <h4 className="text-sm text-gray-400 mb-4">You Earned Badges</h4>
          <div className="flex gap-3 flex-wrap">
            {earnedBadges.length > 0 ? (
              earnedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30 mb-2">
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {badge.name}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No badges earned yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Rewards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-gray-400">Upcoming Rewards</h4>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex gap-3">
            {upcomingBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-red-500/30 mb-2 relative">
                  <Gift className="w-6 h-6 text-red-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Daily Rewards
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
