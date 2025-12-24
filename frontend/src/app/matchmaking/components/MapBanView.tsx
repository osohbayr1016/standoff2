"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TeamLeaderCard from "./TeamLeaderCard";
import MapGrid from "./MapGrid";
import MapBanHeader from "./MapBanHeader";
import MapBanHistory from "./MapBanHistory";

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

const allMaps = ["Hanami", "Rust", "Zone 7", "Dune", "Breeze", "Province", "Sandstone"];
const mapImages: Record<string, string> = {
  Hanami: "/1200px-Hanami_Map.png",
  Rust: "/1200px-Rust_Map.png",
  "Zone 7": "/1200px-Zone7_Standoff_2_Map.jpg",
  Dune: "/1200px-Dune_Map.png",
  Breeze: "/1200px-Breeze_Standoff_2_Map.jpg",
  Province: "/1200px-Province_Map.jpg",
  Sandstone: "/1200px-Standstone_Standoff_2_Map.jpg",
};

export default function MapBanView({
  mapBanData,
  onBanMap,
  isTeamLeader,
  userTeam,
}: MapBanViewProps) {
  const [isBanning, setIsBanning] = useState<string | null>(null);

  useEffect(() => {
    if (isBanning && mapBanData.bannedMaps.includes(isBanning)) {
      const timer = setTimeout(() => setIsBanning(null), 300);
      return () => clearTimeout(timer);
    }
  }, [mapBanData.bannedMaps, isBanning]);

  const isMyTurn = isTeamLeader && mapBanData.currentBanTeam === userTeam;
  const canBan = isMyTurn && mapBanData.mapBanPhase;

  const alphaTeamName = mapBanData.teamAlphaLeader?.name ? `Team ${mapBanData.teamAlphaLeader.name}` : "Team Alpha";
  const bravoTeamName = mapBanData.teamBravoLeader?.name ? `Team ${mapBanData.teamBravoLeader.name}` : "Team Bravo";
  const currentTeamName = mapBanData.currentBanTeam === "alpha" ? alphaTeamName : bravoTeamName;

  const handleMapClick = (mapName: string) => {
    if (canBan && !mapBanData.bannedMaps.includes(mapName) && !isBanning) {
      setIsBanning(mapName);
      onBanMap(mapName);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative px-4">
      <MapBanHeader mapBanPhase={mapBanData.mapBanPhase} currentTeamName={currentTeamName} selectedMap={mapBanData.selectedMap} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-4xl">
        <TeamLeaderCard teamName={alphaTeamName} leaderName={mapBanData.teamAlphaLeader?.name} isCurrentTurn={mapBanData.currentBanTeam === "alpha"} teamColor="alpha" />
        <TeamLeaderCard teamName={bravoTeamName} leaderName={mapBanData.teamBravoLeader?.name} isCurrentTurn={mapBanData.currentBanTeam === "bravo"} teamColor="bravo" />
      </div>

      <MapGrid allMaps={allMaps} bannedMaps={mapBanData.bannedMaps} selectedMap={mapBanData.selectedMap} isBanning={isBanning} canBan={canBan} onMapClick={handleMapClick} mapImages={mapImages} />

      <MapBanHistory banHistory={mapBanData.banHistory} alphaTeamName={alphaTeamName} bravoTeamName={bravoTeamName} />

      {isTeamLeader && !isMyTurn && mapBanData.mapBanPhase && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg text-center">
          <p className="text-yellow-200 text-sm">👑 You are the team leader. Wait for your turn to ban.</p>
        </motion.div>
      )}

      {!isTeamLeader && mapBanData.mapBanPhase && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-gray-800/50 border-2 border-gray-600 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Only team leaders can ban maps. Watch the ban phase.</p>
        </motion.div>
      )}
    </div>
  );
}
