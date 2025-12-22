"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.name || "Mondy");
  const [serverRegion, setServerRegion] = useState("North East");
  const [crossPlay, setCrossPlay] = useState(false);
  const [matchFound, setMatchFound] = useState(true);
  const [dailyRewards, setDailyRewards] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);

  const regions = [
    "North East",
    "North America",
    "Europe",
    "Asia",
    "South America",
    "Oceania",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#0f1117] to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-white mb-8">
          Settings.
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">
                Profile Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 bg-[#252840] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Enter your nickname"
                  />
                </div>

                <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">
                Game Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Server Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Server Region
                  </label>
                  <select
                    value={serverRegion}
                    onChange={(e) => setServerRegion(e.target.value)}
                    className="w-full px-4 py-3 bg-[#252840] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cross-play Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Cross-play</span>
                  <button
                    onClick={() => setCrossPlay(!crossPlay)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      crossPlay ? "bg-orange-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        crossPlay ? "translate-x-7" : ""
                      }`}
                    />
                  </button>
                </div>
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
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      matchFound ? "bg-orange-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        matchFound ? "translate-x-7" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Daily Rewards */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-white font-medium">Daily Rewards</span>
                  <button
                    onClick={() => setDailyRewards(!dailyRewards)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      dailyRewards ? "bg-orange-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        dailyRewards ? "translate-x-7" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Friend Requests */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-white font-medium">Friend Requests</span>
                  <button
                    onClick={() => setFriendRequests(!friendRequests)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      friendRequests ? "bg-orange-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        friendRequests ? "translate-x-7" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Preview */}
          <div className="lg:col-span-1">
            <div className="bg-[#1e2233] rounded-2xl p-8 border border-gray-800/50 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">
                Profile Settings
              </h2>

              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold text-white">{nickname}</span>
                <Image
                  src={user?.avatar || "/default-avatar.png"}
                  alt={nickname}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-purple-500"
                />
              </div>

              <button className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
