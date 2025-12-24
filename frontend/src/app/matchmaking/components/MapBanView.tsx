"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Clock, Ban } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";

interface MapBanViewProps {
  lobbyId: string;
  currentUserId: string;
  mapBanData: {
    availableMaps: string[];
    bannedMaps: string[];
    selectedMap?: string;
    currentBanTeam?: "alpha" | "bravo";
    teamAlphaLeader?: any;
    teamBravoLeader?: any;
    banHistory: Array<{ team: string; map: string; timestamp: Date }>;
    mapBanPhase: boolean;
  };
  onBanMap: (mapName: string) => void;
  isTeamLeader: boolean;
  userTeam: "alpha" | "bravo" | null;
}

const MapBanView: React.FC<MapBanViewProps> = ({
  lobbyId,
  currentUserId,
  mapBanData,
  onBanMap,
  isTeamLeader,
  userTeam,
}) => {
  const [isBanning, setIsBanning] = useState<string | null>(null);

  // Clear isBanning state when bannedMaps changes (realtime update received)
  useEffect(() => {
    if (isBanning && mapBanData.bannedMaps.includes(isBanning)) {
      // The map we were banning is now officially banned, clear the state
      const timer = setTimeout(() => {
        setIsBanning(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mapBanData.bannedMaps, isBanning]);

  const allMaps = [
    "Hanami",
    "Rust",
    "Zone 7",
    "Dune",
    "Breeze",
    "Province",
    "Sandstone",
  ];

  // Map images from public folder
  const mapImages: Record<string, string> = {
    Hanami: "/1200px-Hanami_Map.png",
    Rust: "/1200px-Rust_Map.png",
    "Zone 7": "/1200px-Zone7_Standoff_2_Map.jpg",
    Dune: "/1200px-Dune_Map.png",
    Breeze: "/1200px-Breeze_Standoff_2_Map.jpg",
    Province: "/1200px-Province_Map.jpg",
    Sandstone: "/1200px-Standstone_Standoff_2_Map.jpg",
  };

  const isMyTurn =
    isTeamLeader && mapBanData.currentBanTeam === userTeam;
  const canBan = isMyTurn && mapBanData.mapBanPhase;

  const handleMapClick = async (mapName: string) => {
    if (canBan && !mapBanData.bannedMaps.includes(mapName) && !isBanning) {
      // Set banning state for immediate visual feedback
      setIsBanning(mapName);
      
      // Call the ban function - server will broadcast update to all players
      onBanMap(mapName);
      
      // isBanning will be cleared by useEffect when server update arrives
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative px-4">
      {/* Header */}
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
            key={mapBanData.currentBanTeam || "none"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400 text-sm sm:text-base"
          >
            {mapBanData.mapBanPhase
              ? `Team ${mapBanData.currentBanTeam === "alpha" ? "Alpha" : mapBanData.currentBanTeam === "bravo" ? "Bravo" : "Alpha"}'s turn to ban`
              : `Selected Map: ${mapBanData.selectedMap}`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Team Leaders Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-4xl">
        <motion.div
          key={`alpha-${mapBanData.currentBanTeam}`}
          initial={false}
          animate={{
            opacity: 1,
            x: 0,
            borderColor:
              mapBanData.currentBanTeam === "alpha"
                ? "rgb(59, 130, 246)"
                : "rgb(75, 85, 99)",
            backgroundColor:
              mapBanData.currentBanTeam === "alpha"
                ? "rgba(59, 130, 246, 0.2)"
                : "rgba(31, 41, 55, 0.5)",
          }}
          transition={{ duration: 0.4 }}
          className={`p-4 rounded-lg border-2 ${
            mapBanData.currentBanTeam === "alpha"
              ? "border-blue-500 bg-blue-500/20"
              : "border-gray-600 bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h3 className="text-xl font-bold text-blue-400">Team Alpha</h3>
            {mapBanData.currentBanTeam === "alpha" && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-yellow-400"
              >
                <Crown className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          {mapBanData.teamAlphaLeader && (
            <p className="text-gray-300 text-sm">
              Leader: {mapBanData.teamAlphaLeader.name || "Unknown"}
            </p>
          )}
        </motion.div>

        <motion.div
          key={`bravo-${mapBanData.currentBanTeam}`}
          initial={false}
          animate={{
            opacity: 1,
            x: 0,
            borderColor:
              mapBanData.currentBanTeam === "bravo"
                ? "rgb(249, 115, 22)"
                : "rgb(75, 85, 99)",
            backgroundColor:
              mapBanData.currentBanTeam === "bravo"
                ? "rgba(249, 115, 22, 0.2)"
                : "rgba(31, 41, 55, 0.5)",
          }}
          transition={{ duration: 0.4 }}
          className={`p-4 rounded-lg border-2 ${
            mapBanData.currentBanTeam === "bravo"
              ? "border-orange-500 bg-orange-500/20"
              : "border-gray-600 bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <h3 className="text-xl font-bold text-orange-400">Team Bravo</h3>
            {mapBanData.currentBanTeam === "bravo" && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-yellow-400"
              >
                <Crown className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          {mapBanData.teamBravoLeader && (
            <p className="text-gray-300 text-sm">
              Leader: {mapBanData.teamBravoLeader.name || "Unknown"}
            </p>
          )}
        </motion.div>
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-6">
        {allMaps.map((mapName) => {
          const isBanned = mapBanData.bannedMaps.includes(mapName);
          const isBanningNow = isBanning === mapName;
          const isSelected = mapBanData.selectedMap === mapName;
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
              whileHover={
                canBan && isAvailable ? { scale: 1.05 } : {}
              }
              whileTap={
                canBan && isAvailable ? { scale: 0.95 } : {}
              }
              onClick={() => handleMapClick(mapName)}
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
                  background: isBanned || isBanningNow
                    ? "linear-gradient(to bottom, rgba(127, 29, 29, 0.7), rgba(69, 10, 10, 0.85))"
                    : isSelected
                    ? "linear-gradient(to bottom, rgba(20, 83, 45, 0.5), rgba(5, 46, 22, 0.7))"
                    : "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))",
                }}
              />

              {/* Map Name */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.div
                  animate={
                    isBanned || isBanningNow
                      ? { scale: 0.9 }
                      : { scale: 1 }
                  }
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

      {/* Ban History */}
      {mapBanData.banHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mt-6"
        >
          <h3 className="text-white font-bold mb-3">Ban History</h3>
          <div className="space-y-2">
            {mapBanData.banHistory.map((ban, index) => (
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
                  Team {ban.team === "alpha" ? "Alpha" : "Bravo"} banned{" "}
                  <span className="font-bold text-white">{ban.map}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {isTeamLeader && !isMyTurn && mapBanData.mapBanPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg text-center"
        >
          <p className="text-yellow-200 text-sm">
            👑 You are the team leader. Wait for your turn to ban.
          </p>
        </motion.div>
      )}

      {!isTeamLeader && mapBanData.mapBanPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-gray-800/50 border-2 border-gray-600 rounded-lg text-center"
        >
          <p className="text-gray-400 text-sm">
            Only team leaders can ban maps. Watch the ban phase.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MapBanView;

