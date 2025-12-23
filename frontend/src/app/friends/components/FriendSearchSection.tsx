"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { API_ENDPOINTS } from "../../../config/api";

interface SearchResult {
  id: string;
  userId: string;
  inGameName: string;
  uniqueId?: string;
  standoff2Id?: string;
  avatar?: string;
  elo: number;
  isOnline: boolean;
}

interface FriendSearchSectionProps {
  getToken: () => string | null;
  onRequestSent: () => void;
}

export default function FriendSearchSection({
  getToken,
  onRequestSent,
}: FriendSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setMessage("");
    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.FRIENDS.SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        if (data.results.length === 0) {
          setMessage("No players found matching your search");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Search failed:", response.status, errorData);
        setMessage(
          errorData.message || `Search failed (${response.status})`
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.FRIENDS.REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        setResults(results.filter((r) => r.userId !== userId));
        setMessage("Friend request sent!");
        onRequestSent();
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Send request error:", error);
      setMessage("Failed to send request");
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Add New Friend</h2>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by Profile ID, Standoff 2 ID, or username"
            className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {searching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Find Player"
          )}
        </button>
      </div>

      {message && (
        <p
          className={`text-sm mb-4 ${
            message.includes("sent") ? "text-green-400" : "text-gray-400"
          }`}
        >
          {message}
        </p>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between bg-[#1a1f2e] rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Image
                src={result.avatar || "/default-avatar.png"}
                alt={result.inGameName}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-white font-medium">{result.inGameName}</p>
                <p className="text-gray-400 text-sm">
                  {result.uniqueId ? (
                    <span className="font-mono text-xs">{result.uniqueId}</span>
                  ) : (
                    result.standoff2Id || "ID not set"
                  )}
                </p>
                <p className="text-orange-500 text-sm">ELO: {result.elo}</p>
              </div>
            </div>

            <button
              onClick={() => handleSendRequest(result.userId)}
              disabled={sendingRequest === result.userId}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {sendingRequest === result.userId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

