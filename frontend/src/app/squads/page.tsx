"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Crown,
  User,
  Gamepad2,
  Calendar,
  Shield,
  Star,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

interface Squad {
  _id: string;
  name: string;
  tag: string;
  leader: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  maxMembers: number;
  game: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
}

// Create Squad Form Component
function CreateSquadForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    game: "Mobile Legends: Bang Bang",
    description: "",
    maxMembers: 7,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const games = [
    "Mobile Legends: Bang Bang",
    "PUBG Mobile",
    "Free Fire",
    "Call of Duty Mobile",
    "Arena of Valor",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Squad name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Squad name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Squad name must be less than 50 characters";
    }

    if (!formData.tag.trim()) {
      newErrors.tag = "Squad tag is required";
    } else if (formData.tag.length < 2) {
      newErrors.tag = "Squad tag must be at least 2 characters";
    } else if (formData.tag.length > 10) {
      newErrors.tag = "Squad tag must be less than 10 characters";
    }

    if (!formData.game) {
      newErrors.game = "Please select a game";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (formData.maxMembers < 5 || formData.maxMembers > 10) {
      newErrors.maxMembers = "Max members must be between 5 and 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.id) {
      setErrors({ submit: "You must be logged in to create a squad." });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/squads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...formData,
          leader: user.id, // Include the current user as the leader
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrors({
          submit:
            errorData.message || "Failed to create squad. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating squad:", error);
      setErrors({ submit: "Failed to create squad. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Squad Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent ${
            errors.name
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="Enter squad name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Squad Tag *
        </label>
        <input
          type="text"
          value={formData.tag}
          onChange={(e) => handleInputChange("tag", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent ${
            errors.tag
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="e.g., THN, FIRE, etc."
        />
        {errors.tag && (
          <p className="text-red-500 text-sm mt-1">{errors.tag}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Game *
        </label>
        <select
          value={formData.game}
          onChange={(e) => handleInputChange("game", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent ${
            errors.game
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {games.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
        {errors.game && (
          <p className="text-red-500 text-sm mt-1">{errors.game}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Members
        </label>
        <input
          type="number"
          min="5"
          max="10"
          value={formData.maxMembers}
          onChange={(e) =>
            handleInputChange("maxMembers", parseInt(e.target.value))
          }
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent ${
            errors.maxMembers
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.maxMembers && (
          <p className="text-red-500 text-sm mt-1">{errors.maxMembers}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Minimum 5, Maximum 10 members (including leader)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent ${
            errors.description
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
          placeholder="Describe your squad and what you're looking for..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-400 text-sm">
            {errors.submit}
          </p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            "Create Squad"
          )}
        </button>
      </div>
    </form>
  );
}

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const games = [
    "All",
    "Mobile Legends: Bang Bang",
    "PUBG Mobile",
    "Free Fire",
    "Call of Duty Mobile",
    "Arena of Valor",
  ];

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/squads", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSquads(data.squads);
        }
      }
    } catch (error) {
      console.error("Error fetching squads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSquads = squads.filter((squad) => {
    const matchesSearch =
      squad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      squad.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      squad.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGame === "All" || squad.game === selectedGame;
    return matchesSearch && matchesGame;
  });

  const isUserInSquad = (squad: Squad) => {
    return squad.members.some((member) => member._id === user?.id);
  };

  const isUserLeader = (squad: Squad) => {
    return squad.leader._id === user?.id;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Squads
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Find and join competitive gaming squads or create your own
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Squad</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search squads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
              >
                {games.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Squads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSquads.map((squad, index) => (
            <motion.div
              key={squad._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Squad Header */}
              <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500">
                {squad.logo && (
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                )}
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {squad.game}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isUserLeader(squad) && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                      {isUserInSquad(squad) && (
                        <Shield className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-lg font-bold mb-1">
                    {squad.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                      #{squad.tag}
                    </span>
                    <span className="text-white text-sm">
                      {squad.members.length}/{squad.maxMembers} members
                    </span>
                  </div>
                </div>
              </div>

              {/* Squad Content */}
              <div className="p-6">
                {squad.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {squad.description}
                  </p>
                )}

                {/* Leader */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={squad.leader.avatar || "/default-avatar.png"}
                      alt={squad.leader.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {squad.leader.name}
                      </span>
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                    <span className="text-xs text-gray-500">Leader</span>
                  </div>
                </div>

                {/* Members Preview */}
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Members ({squad.members.length})
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {squad.members.slice(0, 5).map((member) => (
                      <div key={member._id} className="w-6 h-6 relative">
                        <Image
                          src={member.avatar || "/default-avatar.png"}
                          alt={member.name}
                          fill
                          className="rounded-full object-cover border-2 border-white dark:border-gray-800"
                        />
                      </div>
                    ))}
                    {squad.members.length > 5 && (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          +{squad.members.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link href={`/squads/${squad._id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View Details
                    </motion.button>
                  </Link>

                  {isUserLeader(squad) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSquads.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No squads found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm || selectedGame !== "All"
                ? "Try adjusting your search criteria"
                : "Be the first to create a squad!"}
            </p>
            {!searchTerm && selectedGame === "All" && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300"
              >
                Create First Squad
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Squad
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <CreateSquadForm
              onSuccess={() => {
                setShowCreateModal(false);
                fetchSquads(); // Refresh the squads list
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
