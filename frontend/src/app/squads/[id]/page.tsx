"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
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
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  MapPin,
  MessageCircle,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

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
  updatedAt: string;
}

interface SquadStats {
  totalMembers: number;
  availableSlots: number;
  memberPercentage: number;
  daysSinceCreated: number;
}

export default function SquadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<SquadStats | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const squadId = params.id as string;

  useEffect(() => {
    fetchSquadDetails();
  }, [squadId]);

  useEffect(() => {
    if (squad) {
      calculateStats();
    }
  }, [squad]);

  const fetchSquadDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/squads/${squadId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch squad details");
      }

      const data = await response.json();
      if (data.success) {
        setSquad(data.squad);
      } else {
        setError(data.message || "Failed to load squad");
      }
    } catch (err) {
      setError("Failed to load squad details");
      console.error("Error fetching squad:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!squad) return;

    const totalMembers = squad.members.length;
    const availableSlots = squad.maxMembers - totalMembers;
    const memberPercentage = (totalMembers / squad.maxMembers) * 100;
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(squad.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    setStats({
      totalMembers,
      availableSlots,
      memberPercentage,
      daysSinceCreated,
    });
  };

  const isUserLeader = () => {
    return user?.id === squad?.leader._id;
  };

  const isUserMember = () => {
    return squad?.members.some((member) => member._id === user?.id) || false;
  };

  const canJoinSquad = () => {
    return (
      !isUserMember() &&
      !isUserLeader() &&
      squad &&
      squad.members.length < squad.maxMembers &&
      squad.isActive
    );
  };

  const handleJoinSquad = async () => {
    if (!user?.id) {
      setError("You must be logged in to join a squad");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/squads/${squadId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Refresh squad details
        await fetchSquadDetails();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to join squad");
      }
    } catch (err) {
      setError("Failed to join squad");
      console.error("Error joining squad:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!user?.id) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/squads/${squadId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Redirect to squads page
        router.push("/squads");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to leave squad");
      }
    } catch (err) {
      setError("Failed to leave squad");
      console.error("Error leaving squad:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSquad = async () => {
    if (!isUserLeader()) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/squads/${squadId}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        router.push("/squads");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete squad");
      }
    } catch (err) {
      setError("Failed to delete squad");
      console.error("Error deleting squad:", err);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading squad details...</p>
        </div>
      </div>
    );
  }

  if (error && !squad) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link
            href="/squads"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Squads
          </Link>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Squad Not Found
          </h1>
          <p className="text-gray-400 mb-4">
            The squad you're looking for doesn't exist.
          </p>
          <Link
            href="/squads"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Squads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/squads"
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Squads
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                {squad.logo && (
                  <Image
                    src={squad.logo}
                    alt={`${squad.name} logo`}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {squad.name}
                  </h1>
                  <p className="text-gray-400">[{squad.tag}]</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isUserLeader() && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </>
              )}

              {canJoinSquad() && (
                <button
                  onClick={handleJoinSquad}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {actionLoading ? "Joining..." : "Join Squad"}
                </button>
              )}

              {isUserMember() && !isUserLeader() && (
                <button
                  onClick={handleLeaveSquad}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  {actionLoading ? "Leaving..." : "Leave Squad"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Squad Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Squad Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Game</p>
                      <p className="text-white font-medium">{squad.game}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Members</p>
                      <p className="text-white font-medium">
                        {squad.members.length}/{squad.maxMembers}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Created</p>
                      <p className="text-white font-medium">
                        {new Date(squad.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p
                        className={`font-medium ${
                          squad.isActive ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {squad.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {stats && (
                    <>
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-gray-400 text-sm">
                            Available Slots
                          </p>
                          <p className="text-white font-medium">
                            {stats.availableSlots}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Days Active</p>
                          <p className="text-white font-medium">
                            {stats.daysSinceCreated}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {squad.description && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {squad.description}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Members Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Members</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>
                    {squad.members.length}/{squad.maxMembers}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {squad.members.map((member, index) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {member.avatar ? (
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {member._id === squad.leader._id && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium">
                            {member.name}
                          </p>
                          {member._id === squad.leader._id && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                      </div>
                    </div>

                    {isUserLeader() && member._id !== squad.leader._id && (
                      <button
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {squad.members.length < squad.maxMembers && (
                <div className="mt-6 p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
                  <UserPlus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {squad.maxMembers - squad.members.length} slot(s) available
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Squad Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Squad Stats
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Member Capacity</span>
                      <span className="text-white">
                        {stats.memberPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.memberPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-white">
                        {stats.totalMembers}
                      </p>
                      <p className="text-gray-400 text-sm">Members</p>
                    </div>
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-white">
                        {stats.availableSlots}
                      </p>
                      <p className="text-gray-400 text-sm">Available</p>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-white">
                      {stats.daysSinceCreated}
                    </p>
                    <p className="text-gray-400 text-sm">Days Active</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Message</span>
                </button>

                {isUserLeader() && (
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Manage Squad</span>
                  </button>
                )}

                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <Trophy className="w-4 h-4" />
                  <span>View Achievements</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Delete Squad
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{squad.name}"? This action cannot
              be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSquad}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
