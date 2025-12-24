"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import CreateLobbyModal from "./components/CreateLobbyModal";
import LobbyGrid from "./components/LobbyGrid";

export default function MatchmakingPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLobbies = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.LOBBY.ACTIVE);
      if (response.ok) {
        const result = await response.json();
        setLobbies(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching lobbies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCreateLobby = async (map: string, link: string) => {
    if (!user) {
      setError("Please log in to create a lobby");
      return;
    }

    try {
      setIsCreating(true);
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.LOBBY.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ map, link }),
      });

      const result = await response.json();
      if (result.success) {
        router.push(`/matchmaking/${result.data._id}`);
      } else {
        setError(result.message || "Failed to create lobby");
      }
    } catch (err) {
      console.error("Error creating lobby:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] pt-24 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                  Live Matchmaking
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <Activity size={14} className="text-green-500" />
                {lobbies.length} Active Lobbies
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white"
            >
              FIND YOUR <span className="text-orange-500">MATCH</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 mt-4 max-w-xl font-medium"
            >
              Join active Standoff 2 lobbies or create your own. Select your
              side, invite friends, and jump straight into the action.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={fetchLobbies}
              className="p-4 bg-gray-800/50 hover:bg-gray-800 text-white rounded-2xl border border-gray-700/50 transition-all flex items-center justify-center"
            >
              <RefreshCw
                size={20}
                className={loading ? "animate-spin text-orange-500" : ""}
              />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 md:flex-none px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold rounded-2xl shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
            >
              <Plus size={24} /> Create Lobby
            </button>
          </motion.div>
        </div>

        {/* Lobbies Grid */}
        <LobbyGrid lobbies={lobbies} loading={loading} />

        {/* Create Lobby Modal */}
        <CreateLobbyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateLobby}
          loading={isCreating}
        />

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-white/20 rounded-lg"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
