"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { User, Users, Bell, Shield, Palette, Globe } from "lucide-react";
import TeamProfileCard from "../components/TeamProfileCard";
import TeamSettingsModal from "../components/TeamSettingsModal";

interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  game: string;
  gameIcon: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isTeamSettingsOpen, setIsTeamSettingsOpen] = useState(false);

  useEffect(() => {
    // Load user team from localStorage
    const savedTeam = localStorage.getItem("userTeam");
    if (savedTeam) {
      try {
        setUserTeam(JSON.parse(savedTeam));
      } catch (error) {
        console.error("Error parsing saved team:", error);
      }
    }
  }, []);

  const tabs = [
    { id: "profile", name: "Профайл", icon: User },
    { id: "team", name: "Миний баг", icon: Users },
    { id: "notifications", name: "Мэдэгдэл", icon: Bell },
    { id: "privacy", name: "Нууцлал", icon: Shield },
    { id: "appearance", name: "Харагдах байдал", icon: Palette },
    { id: "language", name: "Хэл", icon: Globe },
  ];

  const handleRemovePlayer = (memberId: string) => {
    if (!userTeam) return;

    const updatedTeam = {
      ...userTeam,
      members: userTeam.members.filter((member) => member.id !== memberId),
    };

    setUserTeam(updatedTeam);
    localStorage.setItem("userTeam", JSON.stringify(updatedTeam));
    // Trigger update event to notify other components
    window.dispatchEvent(new Event("teamUpdated"));
  };

  const handleLeaveTeam = () => {
    setUserTeam(null);
    localStorage.removeItem("userTeam");
    // Trigger update event to notify other components
    window.dispatchEvent(new Event("teamUpdated"));
  };

  const handleTeamSettings = () => {
    setIsTeamSettingsOpen(true);
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setUserTeam(updatedTeam);
    // Trigger update event to notify other components
    window.dispatchEvent(new Event("teamUpdated"));
  };

  const handleTeamDeleted = () => {
    setUserTeam(null);
    // Trigger update event to notify other components
    window.dispatchEvent(new Event("teamUpdated"));
  };

  const isTeamOwner = userTeam && user && userTeam.createdBy === user.id;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Нэвтэрч орно уу
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Тохиргоо хэсэгт нэвтрэхийн тулд эхлээд нэвтэрч орно уу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Тохиргоо
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Өөрийн профайл болон багийн тохиргоог удирдана уу
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-purple-100 dark:bg-gray-700 text-purple-600 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Профайлын тохиргоо
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Нэр
                    </label>
                    <input
                      type="text"
                      defaultValue={user.name || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      И-мэйл
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300"
                  >
                    Хадгалах
                  </motion.button>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === "team" && (
              <div className="space-y-6">
                {userTeam ? (
                  <TeamProfileCard
                    team={userTeam}
                    isOwner={isTeamOwner || false}
                    onRemovePlayer={handleRemovePlayer}
                    onLeaveTeam={!isTeamOwner ? handleLeaveTeam : undefined}
                    onTeamSettings={
                      isTeamOwner ? handleTeamSettings : undefined
                    }
                  />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Та багт орж байхгүй байна
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Баг үүсгэх эсвэл нэгдэхийн тулд профайлын цэсээс &quot;Баг
                      үүсгэх&quot; товчийг дарна уу.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Мэдэгдлийн тохиргоо
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Багийн урилга
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Багт орох урилга ирэхэд мэдэгдэх
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Нууцлалын тохиргоо
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Нууцлалын тохиргоо удахгүй нэмэгдэх болно.
                </p>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Харагдах байдлын тохиргоо
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Харагдах байдлын тохиргоо удахгүй нэмэгдэх болно.
                </p>
              </div>
            )}

            {activeTab === "language" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Хэлний тохиргоо
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Хэлний тохиргоо удахгүй нэмэгдэх болно.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Team Settings Modal */}
      {userTeam && (
        <TeamSettingsModal
          isOpen={isTeamSettingsOpen}
          onClose={() => setIsTeamSettingsOpen(false)}
          team={userTeam}
          onTeamUpdated={handleTeamUpdated}
          onTeamDeleted={handleTeamDeleted}
        />
      )}
    </div>
  );
}
