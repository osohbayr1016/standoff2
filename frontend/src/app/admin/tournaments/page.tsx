"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  Trophy,
  MapPin,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Tournament {
  id: string;
  name: string;
  game: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizePool: number;
  entryFee: number;
  maxSquads: number;
  currentSquads: number;
  status: string;
  location: string;
  organizer: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTournamentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null
  );

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
        const response = await fetch("/api/tournaments");
        const data = await response.json();

        if (data.success) {
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTournaments();
    }
  }, [user]);

  // Filter tournaments based on search and filters
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = !selectedGame || tournament.game === selectedGame;
    const matchesStatus =
      !selectedStatus || tournament.status === selectedStatus;

    return matchesSearch && matchesGame && matchesStatus;
  });

  const games = [
    "Mobile Legends: Bang Bang",
    "PUBG Mobile",
    "Free Fire",
    "Call of Duty Mobile",
  ];
  const statuses = [
    "upcoming",
    "registration_open",
    "registration_closed",
    "ongoing",
    "completed",
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} MNT`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open":
        return "bg-green-500/20 text-green-400";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400";
      case "registration_closed":
        return "bg-yellow-500/20 text-yellow-400";
      case "ongoing":
        return "bg-purple-500/20 text-purple-400";
      case "completed":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "registration_open":
        return "Registration Open";
      case "upcoming":
        return "Upcoming";
      case "registration_closed":
        return "Registration Closed";
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        const response = await fetch(`/api/tournaments/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setTournaments(
            tournaments.filter((tournament) => tournament.id !== id)
          );
        }
      } catch (error) {
        console.error("Error deleting tournament:", error);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Tournament Management
                </h1>
                <p className="text-gray-400">
                  Create and manage tournaments, competitions, and events
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tournaments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Games</option>
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedGame("");
                    setSelectedStatus("");
                  }}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tournaments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-4 text-gray-300">Loading tournaments...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No tournaments found
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedGame || selectedStatus
                    ? "Try adjusting your filters"
                    : "Get started by creating your first tournament"}
                </p>
                {!searchTerm && !selectedGame && !selectedStatus && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Tournament
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredTournaments.map((tournament) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {tournament.name}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                tournament.status
                              )}`}
                            >
                              {getStatusText(tournament.status)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Gamepad2 className="w-4 h-4" />
                              <span>{tournament.game}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{tournament.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(tournament.startDate)}</span>
                            </div>
                          </div>
                          <p className="text-gray-300 line-clamp-2">
                            {tournament.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end mb-4">
                        {tournament.id ? (
                          <Link
                            href={`/admin/tournaments/${tournament.id}`}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details & Teams</span>
                          </Link>
                        ) : (
                          <div className="px-4 py-2 bg-gray-500 text-white rounded-lg cursor-not-allowed opacity-50">
                            <span>ID Missing</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {formatCurrency(tournament.prizePool)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Prize Pool
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">
                            {formatCurrency(tournament.entryFee)}
                          </div>
                          <div className="text-xs text-gray-400">Entry Fee</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400">
                            {tournament.currentSquads}/{tournament.maxSquads}
                          </div>
                          <div className="text-xs text-gray-400">Squads</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {formatDate(tournament.registrationDeadline)}
                          </div>
                          <div className="text-xs text-gray-400">Deadline</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingTournament(tournament)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(tournament.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                        <Link
                          href={`/admin/tournaments/${tournament.id}`}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create New Tournament
            </h2>
            <p className="text-gray-400 mb-6">
              This feature will be implemented in the next update.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTournament && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Edit Tournament
            </h2>
            <p className="text-gray-400 mb-6">
              This feature will be implemented in the next update.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingTournament(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
