"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Check, XCircle } from "lucide-react";
import ProofGrid from "./ProofGrid";
import ImageModal from "./ImageModal";

interface MatchResultCardProps {
  result: any;
  onApprove: (resultId: string, winnerTeam: "alpha" | "bravo", winnerTeamName: string) => void;
  onReject: (resultId: string) => void;
  loading?: boolean;
}

export default function MatchResultCard({
  result,
  onApprove,
  onReject,
  loading = false,
}: MatchResultCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const lobby = result.lobby;
  const teamAlpha = lobby?.teamAlpha || [];
  const teamBravo = lobby?.teamBravo || [];

  const getTeamName = (team: any[], teamKey: "alpha" | "bravo") => {
    if (team && team.length > 0) {
      const firstPlayer = team[0];
      return firstPlayer?.inGameName || firstPlayer?.name || "Unknown";
    }
    
    // Fallback to players array
    const playersInTeam = lobby?.players?.filter((p: any) => p.team === teamKey) || [];
    if (playersInTeam.length > 0) {
      const firstPlayer = playersInTeam[0];
      // In enriched result, userId is populated with User object
      return (
        firstPlayer?.inGameName || 
        firstPlayer?.userId?.inGameName || 
        firstPlayer?.userId?.name || 
        "Unknown"
      );
    }
    
    return "Unknown Team";
  };

  const teamAlphaName = getTeamName(teamAlpha, "alpha");
  const teamBravoName = getTeamName(teamBravo, "bravo");

  const handleDownloadProof = () => {
    result.screenshots.forEach((url: string, index: number) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `proof-${result._id}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Match ID</label>
            <p className="text-white font-semibold mt-1">{result._id}</p>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Teams</label>
            <p className="text-white font-semibold mt-1">{teamAlphaName} vs {teamBravoName}</p>
          </div>
        </div>

        {lobby?.selectedMap && (
          <div>
            <label className="text-gray-400 text-sm">Map</label>
            <p className="text-white font-semibold mt-1">{lobby.selectedMap}</p>
          </div>
        )}

        <ProofGrid screenshots={result.screenshots} onViewImage={setSelectedImage} />

        {result.status === "PENDING" && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button onClick={handleDownloadProof} disabled={loading} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Proof
            </button>
            <button onClick={() => onApprove(result._id, "alpha", teamAlphaName)} disabled={loading} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Confirm Win: {teamAlphaName} (+25 ELO)
            </button>
            <button onClick={() => onApprove(result._id, "bravo", teamBravoName)} disabled={loading} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Confirm Win: {teamBravoName} (+25 ELO)
            </button>
            <button onClick={() => onReject(result._id)} disabled={loading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Dispute/Reject
            </button>
          </div>
        )}

        {result.status !== "PENDING" && (
          <div className="mt-4 p-3 rounded-lg bg-gray-700/50">
            <div className="flex items-center gap-2">
              {result.status === "APPROVED" ? <Check className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              <span className="text-white font-semibold">Status: {result.status}</span>
            </div>
            {result.winnerTeam && (
              <p className="text-gray-300 text-sm mt-1">Winner: {result.winnerTeam === "alpha" ? teamAlphaName : teamBravoName}</p>
            )}
            {result.moderatorNotes && <p className="text-gray-400 text-sm mt-1">{result.moderatorNotes}</p>}
          </div>
        )}
      </motion.div>

      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </>
  );
}
