"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";
import LobbyView from "../components/LobbyView";
import ResultUploadModal from "../components/ResultUploadModal";
import LobbyChat from "../components/LobbyChat";
import InviteFriendsModal from "../components/InviteFriendsModal";
import { useLobby } from "../hooks/useLobby";

export default function MatchmakingLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, getToken } = useAuth();
  const lobbyId = params.id as string;

  const { lobbyData, loading, error, socketRef, fetchLobby, setError } = useLobby(lobbyId, user, getToken);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [resultSubmitted, setResultSubmitted] = useState(false);

  const handleJoinTeam = async (team: "alpha" | "bravo") => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.LOBBY.BASE}/${lobbyId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ team }),
      });
      if (response.ok) { socketRef.current?.emit("refresh_lobby", { lobbyId }); }
      else {
        const result = await response.json();
        setError(result.message || "Failed to join team");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) { setError("Failed to join team"); }
  };

  const handleKick = async (targetUserId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.LOBBY.BASE}/${lobbyId}/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ targetUserId }),
      });
      if (response.ok) {
        socketRef.current?.emit("player_kicked_notify", { lobbyId, targetUserId });
        socketRef.current?.emit("refresh_lobby", { lobbyId });
      }
    } catch (err) { console.error("Kick error:", err); }
  };

  const handlePlayerReady = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.LOBBY.BASE}/${lobbyId}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (response.ok) { socketRef.current?.emit("refresh_lobby", { lobbyId }); }
    } catch (err) { console.error("Ready error:", err); }
  };

  const handleInvite = (friendId: string) => {
    socketRef.current?.emit("send_lobby_invite", {
      friendId,
      lobbyData: { lobbyId, map: lobbyData?.selectedMap, hostName: user?.name },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] pt-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <button onClick={() => router.push("/matchmaking")} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-xs tracking-widest">Back to Matchmaking</span>
        </button>

        {lobbyData && (
          <LobbyView
            lobbyId={lobbyData.lobbyId}
            leaderId={lobbyData.leaderId}
            selectedMap={lobbyData.selectedMap}
            lobbyLink={lobbyData.lobbyLink}
            players={lobbyData.players}
            teamAlpha={lobbyData.teamAlpha}
            teamBravo={lobbyData.teamBravo}
            currentUserId={user?.id || ""}
            allPlayersReady={lobbyData.allPlayersReady || false}
            onPlayerReady={handlePlayerReady}
            onJoinTeam={handleJoinTeam}
            onKick={handleKick}
            onInviteOpen={() => setShowInviteModal(true)}
            addResultButton={
              lobbyData.allPlayersReady && !resultSubmitted ? (
                <button onClick={() => setShowResultModal(true)} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all">
                  📸 SUBMIT MATCH RESULT
                </button>
              ) : null
            }
          />
        )}

        <LobbyChat lobbyId={lobbyId} socket={socketRef.current} currentUserId={user?.id || ""} />
        <ResultUploadModal isOpen={showResultModal} onClose={() => setShowResultModal(false)} lobbyId={lobbyId} onSuccess={() => setResultSubmitted(true)} />
        <InviteFriendsModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onInvite={handleInvite} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-2xl flex items-center gap-3">
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
