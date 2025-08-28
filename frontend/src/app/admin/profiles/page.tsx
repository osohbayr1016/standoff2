"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Filter,
  Edit,
  Trash2,
  User,
  Gamepad2,
  Star,
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

interface PlayerProfile {
  _id: string;
  userId: string;
  inGameName: string;
  game: string;
  rank: string;
  rankStars?: number;
  preferredRoles: string[];
  experience: string;
  description: string;
  isLookingForTeam: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function AdminProfilesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Check admin access
  useEffect(() => {
    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    if (!user || !isAdmin) {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch profiles data
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.ALL);
        const data = await response.json();

        if (data.success) {
          setProfiles(data.profiles || []);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    if (user && isAdmin) {
      fetchProfiles();
    }
  }, [user]);

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" &&
          window.location.hostname !== "localhost"
            ? "https://e-sport-connection-0596.onrender.com"
            : "http://localhost:8000")
        }/api/player-profiles/profiles/${profileId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setProfiles(profiles.filter((profile) => profile._id !== profileId));
      } else {
        alert("Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Error deleting profile");
    }
  };

  const handleViewProfile = (profileId: string) => {
    router.push(`/players/${profileId}`);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.inGameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGame === "All" || profile.game === selectedGame;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Online" && profile.isOnline) ||
      (selectedStatus === "Offline" && !profile.isOnline) ||
      (selectedStatus === "Looking for Team" && profile.isLookingForTeam);
    return matchesSearch && matchesGame && matchesStatus;
  });

  const getRankColor = (rank: string) => {
    if (rank.includes("Mythical")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    } else if (rank.includes("Legend")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else if (rank.includes("Epic")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else {
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isAdmin =
    user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">
                Access Denied
              </h1>
              <p className="text-gray-400 mb-6">
                You don&apos;t have permission to access the admin panel.
              </p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading profiles...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                  Profile Management
                </h1>
                <p className="text-gray-300">
                  Manage player and organization profiles
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Games</option>
                <option value="Mobile Legends">Mobile Legends</option>
                <option value="Valorant">Valorant</option>
                <option value="CS2">CS2</option>
                <option value="Dota 2">Dota 2</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="PUBG">PUBG</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="Standoff 2">Standoff 2</option>
                <option value="Warcraft">Warcraft</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Status</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Looking for Team">Looking for Team</option>
              </select>

              <div className="text-right">
                <span className="text-gray-400 text-sm">
                  {filteredProfiles.length} profiles
                </span>
              </div>
            </div>
          </motion.div>

          {/* Profiles List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredProfiles.map((profile) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-orange-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {profile.inGameName}
                        </h3>
                        {profile.isOnline && (
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-2">
                        {profile.user?.name} ({profile.user?.email})
                      </p>

                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                          {profile.game}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getRankColor(
                            profile.rank
                          )}`}
                        >
                          {profile.rank}
                          {profile.rankStars &&
                            profile.rank.includes("Mythical") && (
                              <span className="ml-1">
                                ⭐ {profile.rankStars}
                              </span>
                            )}
                        </span>
                        {profile.isLookingForTeam && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                            Looking for Team
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {profile.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Gamepad2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {profile.experience}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {profile.preferredRoles.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">Profile</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewProfile(profile._id)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Shield className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No profiles found
                </h3>
                <p className="text-gray-400">
                  {searchTerm ||
                  selectedGame !== "All" ||
                  selectedStatus !== "All"
                    ? "Try adjusting your search terms or filters"
                    : "No player profiles created yet"}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
