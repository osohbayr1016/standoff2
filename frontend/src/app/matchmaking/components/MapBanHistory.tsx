"use client";

import { motion } from "framer-motion";

interface BanHistoryItem {
  team: string;
  map: string;
  timestamp: Date;
}

interface MapBanHistoryProps {
  banHistory: BanHistoryItem[];
  alphaTeamName: string;
  bravoTeamName: string;
}

export default function MapBanHistory({
  banHistory,
  alphaTeamName,
  bravoTeamName,
}: MapBanHistoryProps) {
  if (banHistory.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mt-6"
    >
      <h3 className="text-white font-bold mb-3">Ban History</h3>
      <div className="space-y-2">
        {banHistory.map((ban, index) => {
          const banTeamName = ban.team === "alpha" ? alphaTeamName : bravoTeamName;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-gray-800/50 rounded"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  ban.team === "alpha" ? "bg-blue-500" : "bg-orange-500"
                }`}
              />
              <span className="text-gray-300 text-sm">
                {banTeamName} banned{" "}
                <span className="font-bold text-white">{ban.map}</span>
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

