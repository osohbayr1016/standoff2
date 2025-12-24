"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS, WS_BASE_URL } from "../../config/api";
import { io, Socket } from "socket.io-client";
import QueuePlayersModal from "./components/QueuePlayersModal";

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

export default function MatchmakingPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [queuePlayers, setQueuePlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const showPlayersButtonRef = useRef<HTMLButtonElement>(null);
  const [fillingBots, setFillingBots] = useState(false);

  // Check for active lobby on mount
  useEffect(() => {
    const checkActiveLobby = async () => {
      if (!user) {
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(API_ENDPOINTS.LOBBY.USER_ACTIVE, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.lobbyId) {
            // User has an active lobby, redirect to it
            router.push(`/matchmaking/${result.data.lobbyId}`);
          }
        }
      } catch (err) {
        console.error("Error checking active lobby:", err);
        // Continue normally if check fails
      }
    };

    checkActiveLobby();
  }, [user, getToken, router]);

  // Debug: Log when playersInQueue changes
  useEffect(() => {
    console.log(`🎯 playersInQueue state changed to: ${playersInQueue}`);
  }, [playersInQueue]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) {
      console.log("❌ No user, waiting for authentication");
      return;
    }

    const initSocket = async () => {
      const token = await getToken();
      if (!token) {
        console.log("❌ No token available, skipping socket connection");
        return;
      }

      console.log("🔌 Initializing Socket.IO connection to:", WS_BASE_URL);
      const socket = io(WS_BASE_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;
      let queueInterval: NodeJS.Timeout;

      // Socket event listeners
      socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO - Socket ID:", socket.id);
        setSocketConnected(true);
        setError(null);

        // Join matchmaking queue room to receive updates
        console.log("🔔 Joining matchmaking room for updates...");
        socket.emit("join_matchmaking_room");

        // Get initial queue status
        setTimeout(() => {
          console.log("🔍 Requesting initial queue status...");
          socket.emit("get_queue_status");
        }, 100);

        // Request queue updates every 1 second for more responsive updates
        queueInterval = setInterval(() => {
          if (socket.connected) {
            socket.emit("get_queue_status");
          }
        }, 1000);

        // Fallback: Check for active lobby every 3 seconds in case socket event missed
        const lobbyCheckInterval = setInterval(async () => {
          if (socket.connected) {
            try {
              const token = await getToken();
              const response = await fetch(API_ENDPOINTS.LOBBY.USER_ACTIVE, {
                headers: {
                  "Content-Type": "application/json",
                  ...(token && { Authorization: `Bearer ${token}` }),
                },
              });
              if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && result.data.lobbyId) {
                  console.log("🔄 Fallback: Found active lobby, navigating...");
                  setIsSearching(false);
                  router.push(`/matchmaking/${result.data.lobbyId}`);
                  clearInterval(lobbyCheckInterval);
                }
              }
            } catch (err) {
              // Silent fail
            }
          }
        }, 3000);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setSocketConnected(false);
        setError("Connection error. Please refresh the page.");
      });

      socket.on("queue_joined", (data) => {
        console.log("✅ Joined queue:", data);
        setIsSearching(true);
        setElapsedTime(0);
        setError(null);
        setButtonClicked(false); // Re-enable button after successful join

        // Immediately request updated queue count
        socket.emit("get_queue_status");
      });

      socket.on("queue_update", (data) => {
        console.log("📊 Queue update received:", data);
        const count = data.totalPlayers || 0;
        console.log(`Setting playersInQueue to: ${count}`);
        setPlayersInQueue(count);
      });

      socket.on("queue_status", (data) => {
        console.log("📊 Queue status received:", data);
        const count = data.totalPlayers || 0;
        console.log(`Setting playersInQueue to: ${count}`);
        setPlayersInQueue(count);
        if (data.inQueue) {
          setIsSearching(true);
        }
      });

      socket.on("lobby_found", (data) => {
        console.log("✅ Lobby found:", data);
        setIsSearching(false);
        setError(null);
        // Navigate to the dynamic lobby page immediately
        if (data.lobbyId) {
          console.log(`🚀 Navigating to lobby: /matchmaking/${data.lobbyId}`);
          router.push(`/matchmaking/${data.lobbyId}`);
        }
      });

      socket.on("lobby_update", (data) => {
        console.log("Lobby update:", data);
        if (data.lobby && data.lobby.players) {
          setLobbyData((prev) =>
            prev
              ? {
                  ...prev,
                  players: data.lobby.players,
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
                  players: data.lobby.players,
                  allPlayersReady: true,
                }
              : null
          );
        }
      });

      socket.on("lobby_cancelled", (data) => {
        console.log("Lobby cancelled:", data);
        setLobbyData(null);
        setError(data.reason || "Lobby was cancelled");
        setTimeout(() => setError(null), 5000);
      });

      socket.on("queue_left", (data) => {
        console.log("✅ Left queue:", data);
        setIsSearching(false);
        setElapsedTime(0);
        setButtonClicked(false); // Re-enable button
      });

      socket.on("queue_error", (data) => {
        console.error("❌ Queue error:", data);
        setError(data.error);
        setIsSearching(false);
        setButtonClicked(false); // Re-enable button on error
        setPlayersInQueue((prev) => Math.max(0, prev - 1)); // Revert optimistic update
        setTimeout(() => setError(null), 5000);
      });

      socket.on("lobby_error", (data) => {
        console.error("Lobby error:", data);
        setError(data.error);
        setTimeout(() => setError(null), 5000);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO");
        setSocketConnected(false);
        if (queueInterval) {
          clearInterval(queueInterval);
        }
      });

      return () => {
        if (queueInterval) {
          clearInterval(queueInterval);
        }
      };
    };

    initSocket();

    return () => {
      console.log("🧹 Cleaning up socket connection");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, getToken]);

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartSearch = async () => {
    console.log("🎮 Find Match button clicked!");

    // Prevent double clicks
    if (isSearching || buttonClicked) {
      console.log("⚠️ Already searching, ignoring click");
      return;
    }

    setButtonClicked(true);

    try {
      if (!user) {
        console.log("❌ No user, showing error");
        setError("Please log in to find a match");
        setButtonClicked(false);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Set searching immediately for instant feedback
      setIsSearching(true);
      setElapsedTime(0);

      // Optimistically update queue count (will be corrected by server)
      setPlayersInQueue((prev) => prev + 1);

      // If socket isn't ready, create it now
      if (!socketRef.current) {
        console.log("🔌 Creating socket connection...");
        const token = await getToken();
        if (token) {
          const socket = io(WS_BASE_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
          });
          socketRef.current = socket;

          // Wait for connection
          await new Promise<void>((resolve) => {
            socket.on("connect", () => {
              console.log("✅ Socket connected!");
              setSocketConnected(true);
              resolve();
            });

            // Timeout after 5 seconds
            setTimeout(() => resolve(), 5000);
          });
        }
      }

      // Emit join queue event
      if (socketRef.current) {
        console.log("✅ Emitting join_queue event");
        socketRef.current.emit("join_queue", { partyMembers: [] });

        // Request queue status immediately after joining
        setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.emit("get_queue_status");
          }
        }, 500);
      } else {
        console.log("❌ No socket available");
        setError("Connection failed. Please refresh the page.");
        setIsSearching(false);
        setPlayersInQueue((prev) => Math.max(0, prev - 1)); // Revert optimistic update
      }
    } catch (error) {
      console.error("❌ Error starting search:", error);
      setError("Failed to join queue. Please try again.");
      setIsSearching(false);
      setPlayersInQueue((prev) => Math.max(0, prev - 1)); // Revert optimistic update
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancelSearch = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave_queue");
      setIsSearching(false);
      setElapsedTime(0);
      setButtonClicked(false); // Re-enable button

      // Decrease queue count optimistically
      setPlayersInQueue((prev) => Math.max(0, prev - 1));

      // Request updated queue status
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("get_queue_status");
        }
      }, 500);
    }
  };

  const handlePlayerReady = () => {
    if (socketRef.current && lobbyData) {
      socketRef.current.emit("player_ready", { lobbyId: lobbyData.lobbyId });
    }
  };

  const handleLeaveLobby = () => {
    if (socketRef.current && lobbyData) {
      socketRef.current.emit("leave_lobby", { lobbyId: lobbyData.lobbyId });
      setLobbyData(null);
    }
  };

  const handleFillBots = async () => {
    if (fillingBots) return;
    
    setFillingBots(true);
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.ADMIN_QUEUE.FILL_BOTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fill bots");
        setTimeout(() => setError(null), 3000);
      } else {
        const data = await response.json();
        console.log("✅ Bots filled:", data);
      }
    } catch (err) {
      console.error("Error filling bots:", err);
      setError("Failed to fill bots");
      setTimeout(() => setError(null), 3000);
    } finally {
      setFillingBots(false);
    }
  };

  const handleShowPlayers = async () => {
    console.log("👥 Show Players button clicked");
    
    // Toggle the dropdown
    if (showPlayersModal) {
      console.log("Closing dropdown");
      setShowPlayersModal(false);
      return;
    }
    
    setLoadingPlayers(true);
    console.log("Opening dropdown...");
    
    try {
      const token = await getToken();
      console.log("🔑 Token obtained:", token ? "Yes" : "No");
      
      const url = API_ENDPOINTS.QUEUE.PLAYERS;
      console.log("🌐 Fetching from:", url);
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Response data:", data);
        
        const players = data.data || data.players || [];
        console.log("👥 Players array:", players);
        console.log("📝 Number of players:", players.length);
        
        setQueuePlayers(players);
      } else {
        const errorText = await response.text();
        console.error("❌ Response not OK:", response.status, errorText);
        // Show test data if API fails
        setQueuePlayers([
          { userId: "1", inGameName: "TestPlayer1", elo: 1000 },
          { userId: "2", inGameName: "TestPlayer2", elo: 1200 },
        ]);
      }
    } catch (error) {
      console.error("❌ Error fetching queue players:", error);
      // Show test data if fetch fails
      setQueuePlayers([
        { userId: "1", inGameName: "TestPlayer1", elo: 1000 },
        { userId: "2", inGameName: "TestPlayer2", elo: 1200 },
      ]);
    } finally {
      setLoadingPlayers(false);
      setShowPlayersModal(true);
      console.log("✅ Dropdown opened, players:", queuePlayers.length);
    }
  };

  // Main matchmaking UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 relative overflow-hidden">

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

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[70vh] px-3 sm:px-4 gap-6 sm:gap-8 md:gap-12"
            >
              {/* Queue Status */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8 max-w-4xl mx-auto"
                >
                  <p className="text-3xl sm:text-4xl lg:text-6xl font-black text-orange-500 leading-tight mb-8 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    Битгий matchmaking хайгаарай guys, discord server-тээ ороод шинэлэлтийн мэдээллүүд орохыг хүлээж байгаарай. 26-нд албан ёсны release хийгдэнэ шүү.
                  </p>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Find a Match
                </h1>
                <div className="flex items-center justify-center gap-3 text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-medium">
                      Players in Queue: {playersInQueue}/10
                    </span>
                  </div>
                  {playersInQueue > 0 && (
                    <div className="relative">
                      <button
                        ref={showPlayersButtonRef}
                        onClick={handleShowPlayers}
                        disabled={loadingPlayers}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loadingPlayers ? "Loading..." : "Show Players"}
                      </button>
                      {/* Dropdown appears here */}
                      <QueuePlayersModal
                        isOpen={showPlayersModal}
                        onClose={() => setShowPlayersModal(false)}
                        players={queuePlayers}
                        buttonRef={showPlayersButtonRef}
                      />
                    </div>
                  )}
                </div>
                {!user && (
                  <p className="text-red-400 text-sm">
                    Please log in to find a match
                  </p>
                )}
              </motion.div>

              {/* Find Match Button */}
              <button
                onClick={handleStartSearch}
                disabled={!user || !socketConnected || isSearching}
                className="w-full max-w-xs sm:max-w-sm px-8 sm:px-12 md:px-16 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-base sm:text-lg md:text-xl font-bold rounded-lg shadow-2xl transition-all duration-300 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {!user
                  ? "Login Required"
                  : !socketConnected
                  ? "Connecting..."
                  : "Find Match"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] relative"
            >
              {/* Main Search Area */}
              <div className="text-center px-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8 max-w-4xl mx-auto"
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-500 leading-tight mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    Битгий matchmaking хайгаарай guys, discord server-тээ ороод шинэлэлтийн мэдээллүүд орохыг хүлээж байгаарай. 26-нд албан ёсны release хийгдэнэ шүү.
                  </p>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12"
                >
                  Searching for Match...
                </motion.h1>

                {/* Queue Status */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#1e2433]/95 to-[#252d3d]/95 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-gray-700/50 shadow-xl mb-6"
                >
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      <span className="text-sm sm:text-base font-medium">
                        Players in Queue: {playersInQueue}/10
                      </span>
                    </div>
                    {playersInQueue > 0 && (
                      <button
                        onClick={handleShowPlayers}
                        disabled={loadingPlayers}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors disabled:opacity-50"
                      >
                        {loadingPlayers ? "..." : "Show"}
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Radar Animation */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8">
                  {/* Orange Border */}
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/50" />

                  {/* Radar Background */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-900/40 to-green-950/60 backdrop-blur-sm overflow-hidden">
                    {/* Grid Lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="30%"
                        fill="none"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fill="none"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="70%"
                        fill="none"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <line
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2="100%"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                    </svg>

                    {/* Scanning Line */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left" />
                    </motion.div>

                    {/* Scanning Dots */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-green-400 rounded-full"
                        style={{
                          top: `${30 + Math.random() * 40}%`,
                          left: `${30 + Math.random() * 40}%`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                      />
                    ))}
                  </div>

                  {/* Map Icon */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-orange-500">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
                    </svg>
                  </div>
                </div>

                {/* Timer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
                    {formatTime(elapsedTime)}
                  </div>
                </motion.div>

                {/* Cancel Button */}
                <motion.button
                  onClick={handleCancelSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm sm:text-base rounded-lg border border-gray-600 transition-all duration-300 backdrop-blur-sm"
                >
                  Cancel Matchmaking
                </motion.button>

                {/* Admin Testing Controls */}
                {user?.role === "ADMIN" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex flex-col items-center gap-3"
                  >
                    <p className="text-gray-400 text-sm font-medium">
                      Admin Testing Controls
                    </p>
                    <button
                      onClick={handleFillBots}
                      disabled={fillingBots || !socketConnected}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold rounded-lg shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                      {fillingBots ? "Filling..." : "🤖 Fill Bots (Admin Testing)"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
