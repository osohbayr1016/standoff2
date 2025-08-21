"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Users,
  Calendar,
  UserPlus,
  ArrowLeft,
  Eye,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import ClanSettingsModal from "../../components/ClanSettingsModal";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

interface ClanMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  joinedAt?: string;
}

interface Clan {
  _id: string;
  name: string;
  tag: string;
  description?: string;
  logo?: string;
  leader?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  members?: ClanMember[];
  maxMembers: number;
  isPremium: boolean;
  createdAt: string;
  memberCount?: number;
  pendingInvitesCount?: number;
}

export default function ClanDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [clan, setClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClan();
    }
  }, [id]);

  const fetchClan = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CLANS.GET(id as string));
      if (!response.ok) {
        throw new Error("Failed to fetch clan");
      }
      const data = await response.json();
      setClan(data.clan || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching clan");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToClan = async () => {
    if (!user || !clan) {
      alert("Please log in to apply to clans");
      return;
    }

    try {
      setApplying(true);
      const response = await fetch(API_ENDPOINTS.CLANS.INVITE(clan._id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ playerId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply to clan");
      }

      alert("Application sent successfully!");
      fetchClan(); // Refresh the clan data
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error applying to clan");
    } finally {
      setApplying(false);
    }
  };

  // Check if current user is the clan leader
  const isClanLeader = user && clan && clan.leader?._id === user.id;

  // Handle clan settings
  const handleClanSettings = () => {
    setIsSettingsModalOpen(true);
  };

  // Handle clan update
  const handleClanUpdated = (updatedClan: Clan) => {
    setClan(updatedClan);
    setIsSettingsModalOpen(false);
  };

  // Handle clan deletion
  const handleClanDeleted = () => {
    // Redirect to clans page after deletion
    window.location.href = "/clans";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-green-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Кланын мэдээллийг ачааллаж байна...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !clan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg font-semibold mb-4">
                Алдаа гарлаа
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {error || "Клан олдсонгүй"}
              </p>
              <Link
                href="/clans"
                className="px-4 py-2 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors"
              >
                Кланууд руу буцах
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const acceptedMembers =
    clan?.members?.filter((m) => m.status === "accepted") || [];
  const pendingMembers =
    clan?.members?.filter((m) => m.status === "pending") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Link
              href="/clans"
              className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Кланууд руу буцах</span>
            </Link>
          </motion.div>

          {/* Clan Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Image
                src={clan.logo || "/default-avatar.png"}
                alt={clan.name}
                width={80}
                height={80}
                className="rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {clan.name}
                  </h1>
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    [{clan.tag}]
                  </span>
                  {clan.isPremium && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {acceptedMembers.length}/{clan.maxMembers} гишүүн
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(clan.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                {isClanLeader && (
                  <button
                    onClick={handleClanSettings}
                    className="flex items-center space-x-2 px-4 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Тохиргоо</span>
                  </button>
                )}
                {user && !isClanLeader && (
                  <button
                    onClick={handleApplyToClan}
                    disabled={applying}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {applying ? "Илгээж байна..." : "Кланд нэгдэх"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          {clan.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Тайлбар
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {clan.description}
              </p>
            </motion.div>
          )}

          {/* Leader */}
          {clan.leader && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Кланын дарга
              </h2>
              <div className="flex items-center space-x-4">
                <Image
                  src={clan.leader?.avatar || "/default-avatar.png"}
                  alt={clan.leader?.name || "Unknown Leader"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {clan.leader?.name || "Unknown Leader"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Кланын дарга
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Гишүүд ({acceptedMembers.length}/{clan.maxMembers})
            </h2>
            {acceptedMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Одоогоор гишүүд байхгүй байна
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <Image
                      src={member.avatar || "/default-avatar.png"}
                      alt={member.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.joinedAt
                          ? formatDate(member.joinedAt)
                          : "Гишүүн"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Clan Settings Modal */}
      {clan && (
        <ClanSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          clan={clan}
          onClanUpdated={handleClanUpdated}
          onClanDeleted={handleClanDeleted}
        />
      )}
    </div>
  );
}
