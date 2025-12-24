"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS, WS_BASE_URL } from "../../../config/api";
import { io, Socket } from "socket.io-client";
import LobbyView from "../components/LobbyView";
import ResultUploadModal from "../components/ResultUploadModal";
import MapBanView from "../components/MapBanView";
import LobbyChat from "../components/LobbyChat";

interface LobbyPlayer {
  userId: string;
  inGameName: string;
  standoff2Id?: string;
  elo: number;
  isReady: boolean;
}

interface LobbyData {
  lobbyId: string;
  players: LobbyPlayer[];
  teamAlpha: string[];
  teamBravo: string[];
  allPlayersReady?: boolean;
}

export default function MatchmakingLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, getToken } = useAuth();
  const lobbyId = params.id as string;

  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [readyingAll, setReadyingAll] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showAddResult, setShowAddResult] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultSubmitted, setResultSubmitted] = useState(false);
  const [mapBanPhase, setMapBanPhase] = useState(false);
  const [mapBanData, setMapBanData] = useState<any>(null);

  // Fetch lobby data on mount
  useEffect(() => {
    const fetchLobby = async () => {
      if (!user || !lobbyId) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(API_ENDPOINTS.LOBBY.GET(lobbyId), {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Lobby not found");
            setTimeout(() => {
              router.push("/matchmaking");
            }, 3000);
          } else {
            setError("Failed to load lobby");
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        if (result.success && result.data) {
          const lobby = result.data;
          setLobbyData({
            lobbyId: lobby._id || lobbyId,
            players: lobby.players.map((p: any) => ({
              userId: p.userId.toString(),
              inGameName: p.inGameName,
              standoff2Id: p.standoff2Id,
              elo: p.elo,
              isReady: p.isReady,
            })),
            teamAlpha: lobby.teamAlpha.map((id: any) => id.toString()),
            teamBravo: lobby.teamBravo.map((id: any) => id.toString()),
            allPlayersReady: lobby.allPlayersReady || false,
          });

          // Check if in map ban phase
          if (lobby.status === "map_ban_phase" || lobby.mapBanPhase) {
            setMapBanPhase(true);
            // Fetch map ban status
            const banStatusResponse = await fetch(
              API_ENDPOINTS.MAP_BAN.STATUS(lobbyId),
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(token && { Authorization: `Bearer ${token}` }),
                },
              }
            );
            if (banStatusResponse.ok) {
              const banStatusResult = await banStatusResponse.json();
              if (banStatusResult.success) {
                setMapBanData(banStatusResult.data);
              }
            }
          }
        } else {
          setError("Lobby not found");
          setTimeout(() => {
            router.push("/matchmaking");
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching lobby:", err);
        setError("Failed to load lobby");
      } finally {
        setLoading(false);
      }
    };

    fetchLobby();
  }, [user, lobbyId, getToken, router]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user || !lobbyId) {
      return;
    }

    const initSocket = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const socket = io(WS_BASE_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      if (socket.connected) {
        console.log("✅ Already connected to Socket.IO");
        setSocketConnected(true);
        socket.emit("join_lobby", { lobbyId });
      }

      socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO - Socket ID:", socket.id);
        setSocketConnected(true);
        setError(null);

        // Join the lobby room
        socket.emit("join_lobby", { lobbyId });
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setSocketConnected(false);
      });

      socket.on("lobby_update", (data) => {
        console.log("Lobby update:", data);
        if (data.lobby && data.lobby.players) {
          setLobbyData((prev) =>
            prev
              ? {
                  ...prev,
                  players: data.lobby.players.map((p: any) => ({
                    userId: p.userId.toString(),
                    inGameName: p.inGameName,
                    standoff2Id: p.standoff2Id,
                    elo: p.elo,
                    isReady: p.isReady,
                  })),
                  allPlayersReady: data.allReady || false,
                }
              : null
          );
        }
      });

      socket.on("all_players_ready", (data) => {
        console.log("All players ready:", data);
        if (data.lobby && data.lobby.players) {
          setLobbyData((prev) =>
            prev
              ? {
                  ...prev,
                  players: data.lobby.players.map((p: any) => ({
                    userId: p.userId.toString(),
                    inGameName: p.inGameName,
                    standoff2Id: p.standoff2Id,
                    elo: p.elo,
                    isReady: p.isReady,
                  })),
                  allPlayersReady: true,
                }
              : null
          );
        }
      });

      socket.on("lobby_cancelled", (data) => {
        console.log("Lobby cancelled:", data);
        setError(data.reason || "Lobby was cancelled");
        setTimeout(() => {
          router.push("/matchmaking");
        }, 3000);
      });

      socket.on("lobby_error", (data) => {
        console.error("Lobby error:", data);
        setError(data.error);
        setTimeout(() => setError(null), 5000);
      });

      // Map ban socket events
      socket.on("map_ban_started", (data) => {
        console.log("Map ban started:", data);
        setMapBanPhase(true);
        setMapBanData(data);
      });

      socket.on("map_ban_update", (data) => {
        console.log("Map ban update received:", data);
        setMapBanData((prev: any) => {
          if (!prev) {
            return data;
          }
          const updated = {
            ...prev,
            availableMaps: data.availableMaps !== undefined ? data.availableMaps : prev.availableMaps,
            bannedMaps: data.bannedMaps !== undefined ? data.bannedMaps : prev.bannedMaps,
            selectedMap: data.selectedMap !== undefined ? data.selectedMap : prev.selectedMap,
            currentBanTeam: data.currentBanTeam !== undefined ? data.currentBanTeam : prev.currentBanTeam,
            mapBanPhase: data.mapBanPhase !== undefined ? data.mapBanPhase : prev.mapBanPhase,
            banHistory: data.banHistory !== undefined ? data.banHistory : prev.banHistory,
            teamAlphaLeader: data.teamAlphaLeader !== undefined ? data.teamAlphaLeader : prev.teamAlphaLeader,
            teamBravoLeader: data.teamBravoLeader !== undefined ? data.teamBravoLeader : prev.teamBravoLeader,
          };
          console.log("Updated map ban data - currentBanTeam:", updated.currentBanTeam);
          return updated;
        });
        if (data.mapBanPhase === false) {
          setMapBanPhase(false);
        }
      });

      socket.on("map_ban_complete", (data) => {
        console.log("Map ban complete:", data);
        setMapBanPhase(false);
        setMapBanData((prev: any) => ({
          ...prev,
          selectedMap: data.selectedMap,
          mapBanPhase: false,
        }));
        // Refresh lobby data
        if (data.lobby) {
          setLobbyData((prev) =>
            prev
              ? {
                  ...prev,
                  players: data.lobby.players.map((p: any) => ({
                    userId: p.userId.toString(),
                    inGameName: p.inGameName,
                    standoff2Id: p.standoff2Id,
                    elo: p.elo,
                    isReady: p.isReady,
                  })),
                }
              : null
          );
        }
      });

      socket.on("map_ban_error", (data) => {
        console.error("Map ban error:", data);
        setError(data.error);
        setTimeout(() => setError(null), 5000);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO");
        setSocketConnected(false);
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, lobbyId, getToken, router]);

  const handlePlayerReady = () => {
    if (socketRef.current && lobbyData && user) {
      // Optimistic update for immediate visual feedback
      setLobbyData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.userId === user.id ? { ...p, isReady: true } : p
          ),
        };
      });

      // Emit to server
      socketRef.current.emit("player_ready", { lobbyId: lobbyData.lobbyId });
    }
  };

  const handleReadyAll = async () => {
    if (readyingAll || !lobbyData) return;
    
    setReadyingAll(true);
    
    // Optimistic update for admin
    setLobbyData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.map((p) => ({ ...p, isReady: true })),
        allPlayersReady: true,
      };
    });

    try {
      const token = await getToken();
      const response = await fetch(
        API_ENDPOINTS.ADMIN_QUEUE.READY_ALL(lobbyData.lobbyId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to ready all players");
        setTimeout(() => setError(null), 3000);
      } else {
        const data = await response.json();
        console.log("✅ All players readied:", data);
      }
    } catch (err) {
      console.error("Error readying all players:", err);
      setError("Failed to ready all players");
      setTimeout(() => setError(null), 3000);
    } finally {
      setReadyingAll(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (socketRef.current && lobbyData) {
      try {
        // If admin, clear bots before leaving
        if (user?.role === "ADMIN") {
          try {
            const token = await getToken();
            await fetch(API_ENDPOINTS.ADMIN_QUEUE.CLEAR_BOTS, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
          } catch (err) {
            console.error("Error clearing bots:", err);
          }
        }

        const token = await getToken();
        const response = await fetch(
          API_ENDPOINTS.LOBBY.LEAVE(lobbyData.lobbyId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (response.ok) {
          localStorage.removeItem(`lobby_chat_${lobbyId}`);
          router.push("/matchmaking");
        }
      } catch (err) {
        console.error("Error leaving lobby:", err);
      }
    }
  };

  const handleResultSuccess = () => {
    setResultSubmitted(true);
    localStorage.removeItem(`lobby_chat_${lobbyId}`);
    setError("Match result submitted successfully!");
    setTimeout(() => setError(null), 3000);
  };

  const handleBanMap = async (mapName: string) => {
    if (!socketRef.current || !lobbyData) return;

    try {
      // Emit ban via socket
      socketRef.current.emit("ban_map", {
        lobbyId: lobbyData.lobbyId,
        mapName,
      });
    } catch (err) {
      console.error("Error banning map:", err);
      setError("Failed to ban map");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Determine if user is team leader and which team
  const isTeamLeader =
    mapBanData &&
    (mapBanData.teamAlphaLeader?._id?.toString() === user?.id ||
      mapBanData.teamBravoLeader?._id?.toString() === user?.id);
  const userTeam =
    lobbyData && user
      ? lobbyData.teamAlpha.includes(user.id)
        ? "alpha"
        : lobbyData.teamBravo.includes(user.id)
        ? "bravo"
        : null
      : null;

  // Countdown timer effect - starts when all players are ready
  useEffect(() => {
    if (lobbyData?.allPlayersReady && !showAddResult && !resultSubmitted) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowAddResult(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lobbyData?.allPlayersReady, showAddResult, resultSubmitted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error && !lobbyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting to matchmaking...</p>
        </div>
      </div>
    );
  }

  if (!lobbyData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 relative overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/sand-yards-map.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px) brightness(0.3)",
        }}
      />

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-20 sm:top-24 left-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl border-2 bg-red-600 border-red-500 flex items-center gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <p className="text-white font-medium text-xs sm:text-sm">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {mapBanPhase && mapBanData ? (
          <MapBanView
            lobbyId={lobbyData.lobbyId}
            currentUserId={user?.id || ""}
            mapBanData={mapBanData}
            onBanMap={handleBanMap}
            isTeamLeader={isTeamLeader || false}
            userTeam={userTeam}
          />
        ) : (
          <LobbyView
          lobbyId={lobbyData.lobbyId}
          players={lobbyData.players}
          teamAlpha={lobbyData.teamAlpha}
          teamBravo={lobbyData.teamBravo}
          currentUserId={user?.id || ""}
          allPlayersReady={lobbyData.allPlayersReady || false}
          onPlayerReady={handlePlayerReady}
          adminReadyAllButton={
            user?.role === "ADMIN" && !lobbyData.allPlayersReady ? (
              <button
                onClick={handleReadyAll}
                disabled={readyingAll}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ {readyingAll ? "Readying..." : "Ready All (Admin)"}
              </button>
            ) : undefined
          }
          countdownElement={
            lobbyData.allPlayersReady && !showAddResult && !resultSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 text-center"
              >
                <motion.p
                  key={countdown}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{
                    textShadow: "0 0 20px rgba(251, 146, 60, 0.8)",
                  }}
                >
                  Match starting in {countdown} seconds...
                </motion.p>
              </motion.div>
            ) : null
          }
          addResultButton={
            showAddResult && !resultSubmitted ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResultModal(true)}
                className="w-full max-w-xs sm:max-w-sm px-8 sm:px-12 md:px-16 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-base sm:text-lg md:text-xl font-bold rounded-lg shadow-2xl transition-all duration-300 uppercase tracking-wider hover:scale-105 active:scale-95"
              >
                📸 Add Match Result
              </motion.button>
            ) : resultSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xs sm:max-w-sm px-8 sm:px-12 md:px-16 py-3 sm:py-4 bg-green-900/50 border-2 border-green-500 text-green-200 text-base sm:text-lg md:text-xl font-bold rounded-lg uppercase tracking-wider"
              >
                ✓ Result Submitted
              </motion.div>
            ) : null
          }
          />
        )}
      </div>

      {/* Result Upload Modal */}
      <ResultUploadModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        lobbyId={lobbyData.lobbyId}
        onSuccess={handleResultSuccess}
      />

      {/* Lobby Chat */}
      <LobbyChat
        lobbyId={lobbyId}
        socket={socketRef.current}
        currentUserId={user?.id || ""}
      />
    </div>
  );
}

