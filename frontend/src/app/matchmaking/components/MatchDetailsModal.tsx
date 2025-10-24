import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Users,
  Coins,
  Calendar,
  MessageCircle,
  Play,
  Flag,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import MatchChat from "./MatchChat";
import ResultSubmitModal from "./ResultSubmitModal";
import DisputeModal from "./DisputeModal";

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
  onUpdate: () => void;
  userSquad: any;
}

export default function MatchDetailsModal({
  match,
  onClose,
  onUpdate,
  userSquad,
}: MatchDetailsModalProps) {
  const { user, getToken } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isChallenger =
    userSquad && match.challengerSquadId._id === userSquad._id;
  const isOpponent = userSquad && match.opponentSquadId?._id === userSquad._id;
  const isParticipant = isChallenger || isOpponent;
  const isLeader = userSquad && user && userSquad.leader._id === user.id;

  const canAccept = !isParticipant && match.status === "PENDING" && isLeader;
  const canStart = isParticipant && match.status === "ACCEPTED" && isLeader;
  const isReady = isChallenger ? match.challengerReady : match.opponentReady;
  const otherSideReady = isChallenger ? match.opponentReady : match.challengerReady;
  const canSubmitResult =
    isParticipant && ["PLAYING", "RESULT_SUBMITTED"].includes(match.status) && isLeader;
  const canCancel =
    isParticipant && ["PENDING", "ACCEPTED"].includes(match.status) && isLeader;
  const canDispute =
    isParticipant &&
    ["PLAYING", "RESULT_SUBMITTED", "COMPLETED"].includes(match.status) &&
    isLeader;
  
  const hasDispute = match.status === "DISPUTED";

  const handleAccept = async () => {
    if (!window.confirm("Энэ match-ийг accept хийх үү?")) return;

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const response = await fetch(
        API_ENDPOINTS.MATCHES.ACCEPT(match._id),
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        onUpdate();
        onClose();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    console.log(`🎮 Start button clicked for match: ${match._id}`);
    console.log(`📊 Current match data:`, {
      status: match.status,
      challengerReady: match.challengerReady,
      opponentReady: match.opponentReady,
      isReady,
      otherSideReady
    });

    if (isReady) {
      setError("Та аль хэдийн бэлэн болсон байна");
      return;
    }

    const confirmMessage = otherSideReady 
      ? "Тоглолт эхэлсэн гэж батлах уу? (Хоёр баг бэлэн байна)"
      : "Бэлэн болох уу? (Нөгөө баг бэлэн болоход тоглолт эхлэх болно)";
    
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      console.log(`🔑 Using token: ${token ? 'Yes' : 'No'}`);
      
      const response = await fetch(
        API_ENDPOINTS.MATCHES.START(match._id),
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      console.log(`📡 Response status: ${response.status}`);
      const data = await response.json();
      console.log(`📊 Response data:`, data);

      if (data.success) {
        console.log(`✅ Start successful, updating match data`);
        onUpdate();
      } else {
        console.error(`❌ Start failed: ${data.message}`);
        setError(data.message);
      }
    } catch (error) {
      console.error(`❌ Start error:`, error);
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Match цуцлах уу? (Цуцалсан тал coin алдана)")) return;

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const response = await fetch(
        API_ENDPOINTS.MATCHES.CANCEL(match._id),
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        onUpdate();
        onClose();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Match дэлгэрэнгүй</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between mb-6 bg-gray-700 p-6 rounded-lg">
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold">
                {match.challengerSquadId.name}
              </p>
              <p className="text-gray-400 text-sm">
                [{match.challengerSquadId.tag}]
              </p>
            </div>

            <div className="px-8">
              <p className="text-3xl font-bold text-purple-400">VS</p>
            </div>

            <div className="flex flex-col items-center flex-1">
              {match.opponentSquadId ? (
                <>
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold">
                    {match.opponentSquadId.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    [{match.opponentSquadId.tag}]
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">Хүлээж байна</p>
                </>
              )}
            </div>
          </div>

          {/* Match Info */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Bounty:</span>
              <span className="text-yellow-400 font-semibold">
                {match.bountyAmount} coins
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Status:</span>
              <span className="font-semibold">{match.status}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Deadline:</span>
              <span>{match.deadline ? new Date(match.deadline).toLocaleString("mn-MN") : "N/A"}</span>
            </div>
          </div>

          {/* Results Status */}
          {(match.challengerResult || match.opponentResult) && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-white font-semibold mb-3">Үр дүнгийн төлөв</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>{match.challengerSquadId.name}:</span>
                  <span className={`font-semibold ${
                    match.challengerResult === "WIN" ? "text-green-400" : 
                    match.challengerResult === "LOSS" ? "text-red-400" : 
                    "text-gray-400"
                  }`}>
                    {match.challengerResult ? 
                      (match.challengerResult === "WIN" ? "Хожлоо" : "Хожигдлоо") : 
                      "Үр дүн оруулаагүй"
                    }
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{match.opponentSquadId?.name || "Хүлээж байна"}:</span>
                  <span className={`font-semibold ${
                    match.opponentResult === "WIN" ? "text-green-400" : 
                    match.opponentResult === "LOSS" ? "text-red-400" : 
                    "text-gray-400"
                  }`}>
                    {match.opponentResult ? 
                      (match.opponentResult === "WIN" ? "Хожлоо" : "Хожигдлоо") : 
                      "Үр дүн оруулаагүй"
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Readiness Status */}
          {match.status === "ACCEPTED" && isParticipant && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-white font-semibold mb-3">Тоглолт эхлүүлэх бэлэн байдал</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>{match.challengerSquadId.name}:</span>
                  <span className={`font-semibold ${
                    match.challengerReady ? "text-green-400" : "text-gray-400"
                  }`}>
                    {match.challengerReady ? "Бэлэн" : "Хүлээж байна"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{match.opponentSquadId?.name || "Хүлээж байна"}:</span>
                  <span className={`font-semibold ${
                    match.opponentReady ? "text-green-400" : "text-gray-400"
                  }`}>
                    {match.opponentReady ? "Бэлэн" : "Хүлээж байна"}
                  </span>
                </div>
                {match.challengerReady && match.opponentReady && (
                  <div className="text-center text-green-400 font-semibold mt-2">
                    ✅ Хоёр баг бэлэн байна! Тоглолт эхлэх боломжтой
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {canAccept && (
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Accept
              </button>
            )}

            {canStart && (
              <button
                onClick={handleStart}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  isReady 
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Play className="w-4 h-4" />
                {isReady ? "Бэлэн байна" : "Бэлэн болох"}
              </button>
            )}

            {canSubmitResult && (
              <button
                onClick={() => setShowResultModal(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Үр дүн оруулах
              </button>
            )}

            {isParticipant && match.status === "ACCEPTED" && (
              <button
                onClick={() => setShowChat(true)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Цуцлах
              </button>
            )}

            {canDispute && !hasDispute && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Dispute
              </button>
            )}
            
            {hasDispute && isParticipant && (
              <div className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Dispute байна (Admin шийдвэрлэх хүлээж байна)
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {showChat && (
        <MatchChat matchId={match._id} onClose={() => setShowChat(false)} />
      )}

      {showResultModal && (
        <ResultSubmitModal
          matchId={match._id}
          match={match}
          onClose={() => setShowResultModal(false)}
          onSuccess={() => {
            setShowResultModal(false);
            onUpdate();
          }}
        />
      )}

      {showDisputeModal && (
        <DisputeModal
          matchId={match._id}
          match={match}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={() => {
            setShowDisputeModal(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}
