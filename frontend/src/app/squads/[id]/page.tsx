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
  Save,
  Upload,
  Lock,
  Unlock,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { SquadJoinType } from "../../../types/squad";
import {
  getJoinTypeLabel,
  getJoinTypeDescription,
  canApplyToSquad,
  applyToSquad,
} from "../../../utils/squadService";
import DivisionCoinImage from "../../../components/DivisionCoinImage";
import { SquadDivision } from "../../../types/division";

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
  game: "Mobile Legends: Bang Bang"; // Fixed to Mobile Legends only
  description?: string;
  logo?: string;
  isActive: boolean;
  joinType: SquadJoinType;
  createdAt: string;
  updatedAt: string;
}

interface SquadStats {
  totalMembers: number;
  availableSlots: number;
  memberPercentage: number;
  daysSinceCreated: number;
  division?: {
    name: string;
    displayName: string;
    currentBountyCoins: number;
    canUpgrade: boolean;
    protectionCount: number;
    consecutiveLosses: number;
    progress: number;
  };
}

interface EditSquadForm {
  name: string;
  tag: string;
  game: "Mobile Legends: Bang Bang"; // Fixed to Mobile Legends only
  description: string;
  maxMembers: number;
  isActive: boolean;
  joinType: SquadJoinType;
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
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<EditSquadForm>({
    name: "",
    tag: "",
    game: "Mobile Legends: Bang Bang",
    description: "",
    maxMembers: 7,
    isActive: true,
    joinType: SquadJoinType.OPEN_FOR_APPLY,
  });
  const [applicationMessage, setApplicationMessage] = useState("");

  const squadId = params.id as string;

  useEffect(() => {
    fetchSquadDetails();
  }, [squadId]);

  useEffect(() => {
    if (squad) {
      calculateStats();
      // Initialize edit form with current squad data
      setEditForm({
        name: squad.name,
        tag: squad.tag,
        game: "Mobile Legends: Bang Bang", // Always Mobile Legends
        description: squad.description || "",
        maxMembers: squad.maxMembers,
        isActive: squad.isActive,
        joinType: squad.joinType,
      });
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

  const calculateStats = async () => {
    if (!squad) return;

    const totalMembers = squad.members.length;
    const availableSlots = squad.maxMembers - totalMembers;
    const memberPercentage = (totalMembers / squad.maxMembers) * 100;
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(squad.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Fetch division info
    let divisionInfo = null;
    try {
      const response = await fetch(`/api/divisions/squad/${squad._id}`);
      if (response.ok) {
        const data = await response.json();
        divisionInfo = data.data;
      }
    } catch (error) {
      console.error("Error fetching division info:", error);
    }

    setStats({
      totalMembers,
      availableSlots,
      memberPercentage,
      daysSinceCreated,
      division: divisionInfo,
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

  const handleEditSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem("token");

      // Update squad details
      const response = await fetch(`/api/squads/${squadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...editForm,
          userId: user.id,
        }),
      });

      if (response.ok) {
        // Refresh squad details
        await fetchSquadDetails();
        setShowEditModal(false);
        setError(""); // Clear any previous errors
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update squad");
      }
    } catch (err) {
      setError("Failed to update squad");
      console.error("Error updating squad:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleApplyToSquad = async () => {
    if (!squad || !user) return;

    setActionLoading(true);
    const token = localStorage.getItem("token");

    try {
      await applyToSquad(
        squadId,
        {
          userId: user.id,
          message: applicationMessage.trim() || undefined,
        },
        token || ""
      );

      setError("");
      setApplicationMessage("");
      setShowApplyModal(false);
      // Show success message or redirect
      alert(
        "Application submitted successfully! The squad leader will review your application."
      );
    } catch (error: any) {
      setError(error.message || "Failed to submit application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "maxMembers" ? parseInt(value) : value,
    }));
  };

  const handleJoinTypeChange = (joinType: SquadJoinType) => {
    setEditForm((prev) => ({
      ...prev,
      joinType,
    }));
  };

  const getJoinTypeIcon = (joinType: SquadJoinType) => {
    switch (joinType) {
      case SquadJoinType.INVITE_ONLY:
        return <Lock className="w-4 h-4" />;
      case SquadJoinType.OPEN_FOR_APPLY:
        return <UserCheck className="w-4 h-4" />;
      case SquadJoinType.EVERYONE_CAN_JOIN:
        return <Unlock className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
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

              {squad && canApplyToSquad(squad) && !isUserMember() && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Apply to Join
                </button>
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

                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Join Type</p>
                      <div className="flex items-center space-x-2">
                        {getJoinTypeIcon(squad.joinType)}
                        <p className="text-white font-medium">
                          {getJoinTypeLabel(squad.joinType)}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {getJoinTypeDescription(squad.joinType)}
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

            {/* Pending Applications Section (for Squad Leaders) */}
            {isUserLeader() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Pending Applications
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <UserCheck className="w-4 h-4" />
                    <span>Review Applications</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-300">
                    Review and respond to applications from players who want to
                    join your squad.
                  </p>

                  <button
                    onClick={() =>
                      router.push(`/squads/${squadId}/applications`)
                    }
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    View Applications
                  </button>
                </div>
              </motion.div>
            )}

            {/* User's Applications Section */}
            {!isUserLeader() && !isUserMember() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    My Applications
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <UserCheck className="w-4 h-4" />
                    <span>Track Your Applications</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-300">
                    View the status of your applications to this squad.
                  </p>

                  <button
                    onClick={() =>
                      router.push(`/squads/user/${user?.id}/applications`)
                    }
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    View My Applications
                  </button>
                </div>
              </motion.div>
            )}
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

            {/* Division Stats */}
            {stats?.division && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  {stats.division.displayName}
                </h3>

                <div className="space-y-4">
                  {/* Bounty Coins */}
                  <div className="text-center p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <div className="flex justify-center mb-2">
                      <DivisionCoinImage
                        division={stats.division.name as SquadDivision}
                        size={32}
                        showGlow={true}
                      />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {stats.division.currentBountyCoins.toLocaleString()}
                    </p>
                    <p className="text-white/80 text-sm">Bounty Coins</p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/80">Progress</span>
                      <span className="text-white font-semibold">
                        {stats.division.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${stats.division.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Protection & Losses */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-green-500/20 rounded-lg">
                      <p className="text-lg font-bold text-white">
                        {stats.division.protectionCount}
                      </p>
                      <p className="text-white/80 text-xs">Protections</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/20 rounded-lg">
                      <p className="text-lg font-bold text-white">
                        {stats.division.consecutiveLosses}
                      </p>
                      <p className="text-white/80 text-xs">
                        Consecutive Losses
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  {stats.division.canUpgrade && (
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
                      <Star className="w-4 h-4" />
                      <span>Upgrade Division!</span>
                    </button>
                  )}
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

      {/* Edit Squad Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Squad</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSquad} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Squad Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Squad Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter squad name"
                    required
                  />
                </div>

                {/* Squad Tag */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Squad Tag
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={editForm.tag}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="TAG"
                    maxLength={10}
                    required
                  />
                </div>

                {/* Game */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game
                  </label>
                  <input
                    type="text"
                    name="game"
                    value="Mobile Legends: Bang Bang"
                    readOnly
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    All squads are for Mobile Legends: Bang Bang
                  </p>
                </div>

                {/* Max Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Members
                  </label>
                  <select
                    name="maxMembers"
                    value={editForm.maxMembers}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter squad description..."
                  maxLength={500}
                />
              </div>

              {/* Join Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Join Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.values(SquadJoinType).map((joinType) => (
                    <button
                      key={joinType}
                      type="button"
                      onClick={() => handleJoinTypeChange(joinType)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editForm.joinType === joinType
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 bg-gray-700 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {getJoinTypeIcon(joinType)}
                        <span className="text-sm font-medium text-white">
                          {getJoinTypeLabel(joinType)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 text-left">
                        {getJoinTypeDescription(joinType)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-300"
                >
                  Squad is active
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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

      {/* Apply to Squad Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Apply to Join Squad
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                This squad requires an application. Please submit your
                application below.
              </p>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Message (Optional)
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell the squad leader why you want to join..."
                  maxLength={500}
                />
                <p className="text-gray-500 text-xs text-right">
                  {applicationMessage.length}/500 characters
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyToSquad}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
