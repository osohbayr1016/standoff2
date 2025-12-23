"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Gamepad2 } from "lucide-react";

interface ProfileStatsProps {
  winRate: number;
  kdRatio: number;
  totalMatches: number;
}

export default function ProfileStats({
  winRate,
  kdRatio,
  totalMatches,
}: ProfileStatsProps) {
  // Generate dynamic graph points based on actual win rate
  // Uses deterministic variation based on winRate for stability
  const graphPoints = useMemo(() => {
    const points: number[] = [];
    const numPoints = 10;
    const startRate = Math.max(0, winRate - 30); // Start 30% below target
    const variation = 8; // Variation range for natural look
    
    // Deterministic "random" variation using winRate as seed
    const seed = Math.floor(winRate * 100) % 1000;
    
    for (let i = 0; i < numPoints - 1; i++) {
      const progress = i / (numPoints - 2); // 0 to 1
      const baseValue = startRate + (winRate - startRate) * progress;
      
      // Deterministic variation using seed and index
      const pseudoRandom = ((seed + i * 73) % 100) / 100; // 0 to 1
      const variationAmount = (pseudoRandom - 0.5) * variation;
      
      const point = Math.max(0, Math.min(100, baseValue + variationAmount));
      points.push(Math.round(point * 10) / 10); // Round to 1 decimal
    }
    
    // Always end with the actual win rate
    points.push(Math.round(winRate * 10) / 10);
    return points;
  }, [winRate]);
  
  const maxPoint = 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Win Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Win Rate</h3>
          </div>
          <span className="text-2xl font-bold text-green-500">
            {winRate.toFixed(2)}%
          </span>
        </div>
        {/* Mini Graph */}
        <div className="h-24 flex items-end gap-1">
          {graphPoints.map((point, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t opacity-60 hover:opacity-100 transition-opacity"
              style={{ height: `${(point / maxPoint) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Low</span>
          <span>Mid</span>
          <span>High</span>
        </div>
      </motion.div>

      {/* Total Matches Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-white">Total Matches Played</h3>
        </div>
        <p className="text-5xl font-bold text-white">{totalMatches}</p>
      </motion.div>
    </div>
  );
}
