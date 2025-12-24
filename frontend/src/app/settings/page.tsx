"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user, getToken } = useAuth();
  const [inGameName, setInGameName] = useState("");
  const [standoff2Id, setStandoff2Id] = useState("");
  const [matchFound, setMatchFound] = useState(true);
  const [dailyRewards, setDailyRewards] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.MY_PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          setInGameName(profile.inGameName || "");
          setStandoff2Id(profile.standoff2Id || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, getToken]);

  const handleSaveChanges = async () => {
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.UPDATE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inGameName,
          standoff2Id,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to save changes");
      }
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#0f1117] to-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-white mb-8">
          Settings.
        </h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              Profile Settings
            </h2>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">Changes saved successfully!</span>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  In-Game Nickname
                </label>
                <input
                  type="text"
                  value={inGameName}
                  onChange={(e) => setInGameName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#252840] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Enter your in-game nickname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Standoff 2 ID
                </label>
                <input
                  type="text"
                  value={standoff2Id}
                  onChange={(e) => setStandoff2Id(e.target.value)}
                  className="w-full px-4 py-3 bg-[#252840] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Enter your Standoff 2 ID"
                />
              </div>

              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              Notification Settings
            </h2>

            <div className="space-y-4">
              {/* Match Found */}
              <div className="flex items-center justify-between py-3">
                <span className="text-white font-medium">Match Found</span>
                <button
                  onClick={() => setMatchFound(!matchFound)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${matchFound ? "bg-orange-600" : "bg-gray-600"
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${matchFound ? "translate-x-7" : ""
                      }`}
                  />
                </button>
              </div>

              {/* Daily Rewards */}
              <div className="flex items-center justify-between py-3">
                <span className="text-white font-medium">Daily Rewards</span>
                <button
                  onClick={() => setDailyRewards(!dailyRewards)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${dailyRewards ? "bg-orange-600" : "bg-gray-600"
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${dailyRewards ? "translate-x-7" : ""
                      }`}
                  />
                </button>
              </div>

              {/* Friend Requests */}
              <div className="flex items-center justify-between py-3">
                <span className="text-white font-medium">Friend Requests</span>
                <button
                  onClick={() => setFriendRequests(!friendRequests)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${friendRequests ? "bg-orange-600" : "bg-gray-600"
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${friendRequests ? "translate-x-7" : ""
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
