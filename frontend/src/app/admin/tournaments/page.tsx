"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
  Users,
  Gamepad2,
  Star,
  Clock,
  MapPin,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

interface Tournament {
  _id: string;
  name: string;
  description: string;
  game: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  location: string;
  organizer: string;
  rules: string;
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
}

interface TournamentFormData {
  name: string;
  description: string;
  game: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  maxParticipants: number;
  location: string;
  organizer: string;
  rules: string;
  registrationDeadline: string;
}

export default function AdminTournamentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedGame, setSelectedGame] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    description: "",
    game: "Mobile Legends",
    startDate: "",
    endDate: "",
    prizePool: 0,
    maxParticipants: 16,
    location: "Online",
    organizer: "",
    rules: "",
    registrationDeadline: "",
  });

  const games = [
    "Mobile Legends",
    "Valorant",
    "CS2",
    "Dota 2",
    "PUBG Mobile",
    "PUBG",
    "Apex Legends",
    "Standoff 2",
    "Warcraft",
  ];

  // Check admin access
  useEffect(() => {
    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    if (!user || !isAdmin) {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch tournaments data
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.TOURNAMENTS.ALL);
        const data = await response.json();

        if (data.success) {
          setTournaments(data.tournaments || []);
        } else {
          console.error("Failed to fetch tournaments:", data.message);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    if (user && isAdmin) {
      fetchTournaments();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      game: "Mobile Legends",
      startDate: "",
      endDate: "",
      prizePool: 0,
      maxParticipants: 16,
      location: "Online",
      organizer: "",
      rules: "",
      registrationDeadline: "",
    });
    setEditingTournament(null);
  };

  const handleCreateTournament = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditTournament = (tournament: Tournament) => {
    setFormData({
      name: tournament.name,
      description: tournament.description,
      game: tournament.game,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      prizePool: tournament.prizePool,
      maxParticipants: tournament.maxParticipants,
      location: tournament.location,
      organizer: tournament.organizer,
      rules: tournament.rules,
      registrationDeadline: tournament.registrationDeadline,
    });
    setEditingTournament(tournament);
    setShowForm(true);
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.TOURNAMENTS.GET(id), {
        method: "DELETE",
      });

      if (response.ok) {
        setTournaments(
          tournaments.filter((tournament) => tournament._id !== id)
        );
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete tournament");
      }
    } catch (error) {
      console.error("Error deleting tournament:", error);
      alert("Error deleting tournament");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingTournament
        ? API_ENDPOINTS.TOURNAMENTS.GET(editingTournament._id)
        : API_ENDPOINTS.TOURNAMENTS.ALL;

      const method = editingTournament ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (editingTournament) {
          setTournaments(
            tournaments.map((item) =>
              item._id === editingTournament._id ? data.tournament : item
            )
          );
        } else {
          setTournaments([data.tournament, ...tournaments]);
        }

        setShowForm(false);
        resetForm();
      } else {
        alert(data.message || "Failed to save tournament");
      }
    } catch (error) {
      console.error("Error saving tournament:", error);
      alert("Error saving tournament");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof TournamentFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ongoing":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || tournament.status === selectedStatus;
    const matchesGame =
      selectedGame === "All" || tournament.game === selectedGame;
    return matchesSearch && matchesStatus && matchesGame;
  });

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
              <p className="mt-4 text-gray-300">Loading tournaments...</p>
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Tournament Management
                </h1>
                <p className="text-gray-300">
                  Create and manage tournaments and competitions
                </p>
              </div>
              <button
                onClick={handleCreateTournament}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Tournament</span>
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
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Games</option>
                {games.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>

              <div className="text-right">
                <span className="text-gray-400 text-sm">
                  {filteredTournaments.length} tournaments
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tournaments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredTournaments.map((tournament) => (
              <motion.div
                key={tournament._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          tournament.status
                        )}`}
                      >
                        {tournament.status.charAt(0).toUpperCase() +
                          tournament.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                        {tournament.game}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {tournament.name}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4">
                      {tournament.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {tournament.currentParticipants}/
                          {tournament.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          ${tournament.prizePool.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {tournament.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditTournament(tournament)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTournament(tournament._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredTournaments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Trophy className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No tournaments found
                </h3>
                <p className="text-gray-400">
                  {searchTerm ||
                  selectedStatus !== "All" ||
                  selectedGame !== "All"
                    ? "Try adjusting your search terms or filters"
                    : "Create your first tournament by clicking 'Create Tournament'"}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Tournament Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingTournament
                      ? "Edit Tournament"
                      : "Create Tournament"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tournament Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Game */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Game *
                    </label>
                    <select
                      value={formData.game}
                      onChange={(e) =>
                        handleInputChange("game", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {games.map((game) => (
                        <option key={game} value={game}>
                          {game}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Organizer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organizer *
                    </label>
                    <input
                      type="text"
                      value={formData.organizer}
                      onChange={(e) =>
                        handleInputChange("organizer", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Prize Pool */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prize Pool ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.prizePool}
                      onChange={(e) =>
                        handleInputChange("prizePool", parseInt(e.target.value))
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        handleInputChange(
                          "maxParticipants",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Registration Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Registration Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) =>
                        handleInputChange(
                          "registrationDeadline",
                          e.target.value
                        )
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Rules */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tournament Rules
                    </label>
                    <textarea
                      value={formData.rules}
                      onChange={(e) =>
                        handleInputChange("rules", e.target.value)
                      }
                      rows={4}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tournament rules and regulations..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>
                          {editingTournament ? "Update" : "Create"} Tournament
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
