"use client";

import { motion } from "framer-motion";
import { Ban } from "lucide-react";

interface MapGridProps {
  allMaps: string[];
  bannedMaps: string[];
  selectedMap?: string;
  isBanning: string | null;
  canBan: boolean;
  onMapClick: (mapName: string) => void;
  mapImages: Record<string, string>;
}

export default function MapGrid({
  allMaps,
  bannedMaps,
  selectedMap,
  isBanning,
  canBan,
  onMapClick,
  mapImages,
}: MapGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-6">
      {allMaps.map((mapName) => {
        const isBanned = bannedMaps.includes(mapName);
        const isBanningNow = isBanning === mapName;
        const isSelected = selectedMap === mapName;
        const isAvailable = !isBanned && !isSelected;

        return (
          <motion.div
            key={mapName}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isBanned || isBanningNow
                ? {
                    opacity: 0.6,
                    scale: 0.85,
                    filter: "brightness(0.7)",
                  }
                : isSelected
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1 }
            }
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            whileHover={canBan && isAvailable ? { scale: 1.05 } : {}}
            whileTap={canBan && isAvailable ? { scale: 0.95 } : {}}
            onClick={() => onMapClick(mapName)}
            className={`relative h-32 sm:h-40 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
              isBanned || isBanningNow
                ? "border-red-500 cursor-not-allowed shadow-2xl shadow-red-900/50"
                : isSelected
                ? "border-green-500"
                : canBan && isAvailable
                ? "border-gray-600 hover:border-blue-500"
                : "border-gray-600 cursor-not-allowed"
            }`}
            style={{
              backgroundImage: mapImages[mapName]
                ? `url(${mapImages[mapName]})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              ...(isBanned || isBanningNow
                ? {
                    boxShadow:
                      "0 10px 40px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(127, 29, 29, 0.3)",
                  }
                : {}),
            }}
          >
            {/* Dark Overlay for text readability */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  isBanned || isBanningNow
                    ? "linear-gradient(to bottom, rgba(127, 29, 29, 0.7), rgba(69, 10, 10, 0.85))"
                    : isSelected
                    ? "linear-gradient(to bottom, rgba(20, 83, 45, 0.5), rgba(5, 46, 22, 0.7))"
                    : "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))",
              }}
            />

            {/* Map Name */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div
                animate={isBanned || isBanningNow ? { scale: 0.9 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center px-2"
              >
                <motion.p
                  animate={
                    isBanned || isBanningNow
                      ? { color: "#fca5a5" }
                      : { color: "#ffffff" }
                  }
                  transition={{ duration: 0.3 }}
                  className="font-bold text-lg sm:text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  {mapName}
                </motion.p>
              </motion.div>
            </div>

            {/* Banned Overlay */}
            {(isBanned || isBanningNow) && (
              <motion.div
                key={`banned-${mapName}-${isBanned}`}
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-b from-red-900/80 to-red-950/90 flex items-center justify-center z-20"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.25 }}
                  className="text-center"
                >
                  <Ban className="w-8 h-8 text-red-300 mx-auto mb-2 drop-shadow-lg" />
                  <p className="text-red-200 font-bold text-sm drop-shadow-md">
                    BANNED
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Selected Overlay */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-green-900/50 flex items-center justify-center z-20"
              >
                <p className="text-green-200 font-bold text-sm">SELECTED</p>
              </motion.div>
            )}

            {/* Click to Ban Indicator */}
            {canBan && isAvailable && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded"
              >
                Click to Ban
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

