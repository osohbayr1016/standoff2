"use client";

import { motion } from "framer-motion";
import { Users, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Lobby {
  _id: string;
  leader: {
    _id: string;
    name: string;
    avatar?: string;
  };
  selectedMap: string;
  players: any[];
  status: string;
}

interface LobbyGridProps {
  lobbies: Lobby[];
  loading: boolean;
}

const MAP_IMAGES: Record<string, string> = {
  "Sandstone": "/1200px-Standstone_Standoff_2_Map.jpg",
  "Rust": "/1200px-Rust_Map.png",
  "Province": "/1200px-Province_Map.jpg",
  "Breeze": "/1200px-Breeze_Standoff_2_Map.jpg",
  "Dune": "/1200px-Dune_Map.png",
  "Hanami": "/1200px-Hanami_Map.png",
};

export default function LobbyGrid({ lobbies, loading }: LobbyGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#1e2433]/50 h-48 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#1e2433]/30 rounded-3xl border border-gray-700/50">
        <Users size={48} className="text-gray-600 mb-4" />
        <p className="text-gray-400 font-medium">No active lobbies found</p>
        <p className="text-gray-500 text-sm mt-1">Create one to start playing!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {lobbies.map((lobby) => (
        <motion.div
          key={lobby._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="group relative bg-[#1e2433] border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl"
        >
          {/* Map Background */}
          <div className="h-32 relative">
            <img 
              src={MAP_IMAGES[lobby.selectedMap] || "/sand-yards-map.png"} 
              alt={lobby.selectedMap}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2433] to-transparent" />
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">{lobby.selectedMap}</span>
            </div>
          </div>

          {/* Lobby Content */}
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                  {lobby.leader.avatar ? (
                    <img src={lobby.leader.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-orange-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold leading-none mb-1">{lobby.leader.name}'s Lobby</h3>
                  <p className="text-xs text-gray-500">Matchmaking Room</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300 font-bold text-sm border border-gray-700">
                <Users size={14} className="text-orange-500" />
                {lobby.players.length}/10
              </div>
            </div>

            <Link
              href={`/matchmaking/${lobby._id}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-orange-600 text-white font-bold rounded-xl transition-all group-hover:bg-orange-600"
            >
              Join Match <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

