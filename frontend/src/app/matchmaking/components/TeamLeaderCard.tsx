"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface TeamLeaderCardProps {
  teamName: string;
  leaderName?: string;
  isCurrentTurn: boolean;
  teamColor: "alpha" | "bravo";
}

export default function TeamLeaderCard({
  teamName,
  leaderName,
  isCurrentTurn,
  teamColor,
}: TeamLeaderCardProps) {
  const dotColor = teamColor === "alpha" ? "bg-blue-500" : "bg-orange-500";
  const textColor = teamColor === "alpha" ? "text-blue-400" : "text-orange-400";
  const borderColor = teamColor === "alpha" ? "rgb(59, 130, 246)" : "rgb(249, 115, 22)";
  const activeBgColor = teamColor === "alpha" ? "rgba(59, 130, 246, 0.2)" : "rgba(249, 115, 22, 0.2)";

  return (
    <motion.div
      key={`${teamColor}-${isCurrentTurn}`}
      initial={false}
      animate={{
        opacity: 1,
        x: 0,
        borderColor: isCurrentTurn ? borderColor : "rgb(75, 85, 99)",
        backgroundColor: isCurrentTurn ? activeBgColor : "rgba(31, 41, 55, 0.5)",
      }}
      transition={{ duration: 0.4 }}
      className={`p-4 rounded-lg border-2 ${
        isCurrentTurn
          ? teamColor === "alpha"
            ? "border-blue-500 bg-blue-500/20"
            : "border-orange-500 bg-orange-500/20"
          : "border-gray-600 bg-gray-800/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
        <h3 className={`text-xl font-bold ${textColor}`}>{teamName}</h3>
        {isCurrentTurn && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-yellow-400"
          >
            <Crown className="w-5 h-5" />
          </motion.div>
        )}
      </div>
      {leaderName && (
        <p className="text-gray-300 text-sm">
          Leader: {leaderName}
        </p>
      )}
    </motion.div>
  );
}

