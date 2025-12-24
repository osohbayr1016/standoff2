"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Clock, Ban } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import TeamLeaderCard from "./TeamLeaderCard";
import MapGrid from "./MapGrid";

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

  const alphaTeamName = mapBanData.teamAlphaLeader?.name
    ? `Team ${mapBanData.teamAlphaLeader.name}`
    : "Team Alpha";
  const bravoTeamName = mapBanData.teamBravoLeader?.name
    ? `Team ${mapBanData.teamBravoLeader.name}`
    : "Team Bravo";
  const currentTeamName =
    mapBanData.currentBanTeam === "alpha" ? alphaTeamName : bravoTeamName;

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
              ? `${currentTeamName}'s turn to ban`
              : `Selected Map: ${mapBanData.selectedMap}`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Team Leaders Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-4xl">
        <TeamLeaderCard
          teamName={alphaTeamName}
          leaderName={mapBanData.teamAlphaLeader?.name}
          isCurrentTurn={mapBanData.currentBanTeam === "alpha"}
          teamColor="alpha"
        />
        <TeamLeaderCard
          teamName={bravoTeamName}
          leaderName={mapBanData.teamBravoLeader?.name}
          isCurrentTurn={mapBanData.currentBanTeam === "bravo"}
          teamColor="bravo"
        />
      </div>

      {/* Maps Grid */}
      <MapGrid
        allMaps={allMaps}
        bannedMaps={mapBanData.bannedMaps}
        selectedMap={mapBanData.selectedMap}
        isBanning={isBanning}
        canBan={canBan}
        onMapClick={handleMapClick}
        mapImages={mapImages}
      />

      {/* Ban History */}
      {mapBanData.banHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mt-6"
        >
          <h3 className="text-white font-bold mb-3">Ban History</h3>
          <div className="space-y-2">
            {mapBanData.banHistory.map((ban, index) => {
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

