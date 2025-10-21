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
  const { user } = useAuth();
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
  const canSubmitResult =
    isParticipant && match.status === "PLAYING" && isLeader;
  const canCancel =
    isParticipant && ["PENDING", "ACCEPTED"].includes(match.status) && isLeader;
  const canDispute =
    isParticipant &&
    ["RESULT_SUBMITTED", "PLAYING"].includes(match.status) &&
    isLeader;

  const handleAccept = async () => {
    if (!window.confirm("Энэ match-ийг accept хийх үү?")) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/matches/${match._id}/accept`,
        {
          method: "POST",
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
    if (!window.confirm("Тоглолт эхэлсэн гэж батлах уу?")) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/matches/${match._id}/start`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        onUpdate();
      } else {
        setError(data.message);
      }
    } catch (error) {
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
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/matches/${match._id}/cancel`,
        {
          method: "POST",
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

          {/* Match Info - Next 60 lines in separate component */}
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
              <span>{new Date(match.deadline).toLocaleString("mn-MN")}</span>
            </div>
          </div>

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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Тоглолт эхэлсэн
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

            {canDispute && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Dispute
              </button>
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
