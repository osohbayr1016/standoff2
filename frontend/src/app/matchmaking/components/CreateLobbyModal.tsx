"use client";

import { useState } from "react";
import { X, Globe, Map as MapIcon, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (map: string, link: string) => void;
  loading: boolean;
}

const STO2_MAPS = [
  { name: "Sandstone", image: "/1200px-Standstone_Standoff_2_Map.jpg" },
  { name: "Rust", image: "/1200px-Rust_Map.png" },
  { name: "Province", image: "/1200px-Province_Map.jpg" },
  { name: "Breeze", image: "/1200px-Breeze_Standoff_2_Map.jpg" },
  { name: "Dune", image: "/1200px-Dune_Map.png" },
  { name: "Hanami", image: "/1200px-Hanami_Map.png" },
];

export default function CreateLobbyModal({ isOpen, onClose, onCreate, loading }: CreateLobbyModalProps) {
  const [selectedMap, setSelectedMap] = useState("");
  const [lobbyLink, setLobbyLink] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1e2433] border border-gray-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#161b28]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="text-orange-500" /> Create Standoff 2 Lobby
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Map Selection */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block flex items-center gap-2">
              <MapIcon size={16} /> Select Map
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STO2_MAPS.map((map) => (
                <button
                  key={map.name}
                  onClick={() => setSelectedMap(map.name)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedMap === map.name ? "border-orange-500 ring-2 ring-orange-500/20" : "border-transparent hover:border-gray-600"
                  }`}
                >
                  <img src={map.image} alt={map.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${selectedMap === map.name ? "bg-orange-500/20" : ""}`}>
                    <span className="text-white font-bold text-sm drop-shadow-md">{map.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lobby Link */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center gap-2">
              <LinkIcon size={16} /> Standoff 2 Lobby Link
            </label>
            <input
              type="text"
              value={lobbyLink}
              onChange={(e) => setLobbyLink(e.target.value)}
              placeholder="Paste your lobby link here..."
              className="w-full bg-[#161b28] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              Open Standoff 2, create a lobby, and copy the invite link.
            </p>
          </div>
        </div>

        <div className="p-6 bg-[#161b28] border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate(selectedMap, lobbyLink)}
            disabled={loading || !selectedMap || !lobbyLink}
            className="flex-[2] px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Lobby"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

