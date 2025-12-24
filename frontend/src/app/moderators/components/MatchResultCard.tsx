"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, X, Check, XCircle, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface MatchResultCardProps {
  result: any;
  onApprove: (resultId: string, winnerTeam: "alpha" | "bravo") => void;
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

  const getTeamName = (team: any[]) => {
    if (!team || team.length === 0) return "Unknown Team";
    const firstPlayer = team[0];
    return firstPlayer?.inGameName || firstPlayer?.name || "Unknown";
  };

  const teamAlphaName = getTeamName(teamAlpha);
  const teamBravoName = getTeamName(teamBravo);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 space-y-4"
      >
        {/* Match ID */}
        <div>
          <label className="text-gray-400 text-sm">Match ID</label>
          <p className="text-white font-semibold mt-1">{result._id}</p>
        </div>

        {/* Teams */}
        <div>
          <label className="text-gray-400 text-sm">Teams</label>
          <p className="text-white font-semibold mt-1">
            {teamAlphaName} vs {teamBravoName}
          </p>
        </div>

        {/* Map */}
        {lobby?.selectedMap && (
          <div>
            <label className="text-gray-400 text-sm">Map</label>
            <p className="text-white font-semibold mt-1">{lobby.selectedMap}</p>
          </div>
        )}

        {/* Submitted Proof */}
        <div>
          <label className="text-gray-400 text-sm flex items-center gap-2">
            <span>Submitted Proof</span>
          </label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {result.screenshots.map((url: string, index: number) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(url)}
              >
                <img
                  src={url}
                  alt={`Proof ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-600 hover:border-orange-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm">View</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {result.status === "PENDING" && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleDownloadProof}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Proof
            </button>
            <button
              onClick={() => onApprove(result._id, "alpha")}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm Win: {teamAlphaName} (+25 ELO)
            </button>
            <button
              onClick={() => onApprove(result._id, "bravo")}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm Win: {teamBravoName} (+25 ELO)
            </button>
            <button
              onClick={() => onReject(result._id)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Dispute/Reject
            </button>
          </div>
        )}

        {/* Status for reviewed results */}
        {result.status !== "PENDING" && (
          <div className="mt-4 p-3 rounded-lg bg-gray-700/50">
            <div className="flex items-center gap-2">
              {result.status === "APPROVED" ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-white font-semibold">
                Status: {result.status}
              </span>
            </div>
            {result.winnerTeam && (
              <p className="text-gray-300 text-sm mt-1">
                Winner: {result.winnerTeam === "alpha" ? teamAlphaName : teamBravoName}
              </p>
            )}
            {result.moderatorNotes && (
              <p className="text-gray-400 text-sm mt-1">{result.moderatorNotes}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Proof"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

