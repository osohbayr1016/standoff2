"use client";

import { motion, AnimatePresence } from "framer-motion";

interface MapBanHeaderProps {
  mapBanPhase: boolean;
  currentTeamName: string;
  selectedMap?: string;
}

export default function MapBanHeader({
  mapBanPhase,
  currentTeamName,
  selectedMap,
}: MapBanHeaderProps) {
  return (
    <div className="text-center mb-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-white mb-2"
      >
        Map Ban Phase
      </motion.h1>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentTeamName || "none"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400 text-sm sm:text-base"
        >
          {mapBanPhase
            ? `${currentTeamName}'s turn to ban`
            : `Selected Map: ${selectedMap}`}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

