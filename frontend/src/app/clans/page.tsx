"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Search, Filter, UserPlus, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

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

export default function ClansPage() {
  const { user } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPremium, setFilterPremium] = useState(false);
  const [applyingClan, setApplyingClan] = useState<string | null>(null);

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchClans = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CLANS.ALL);
      if (!response.ok) {
        throw new Error("Failed to fetch clans");
      }
      const data = await response.json();
      setClans(data.clans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching clans");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToClan = async (clanId: string) => {
    if (!user) {
      alert("Please log in to apply to clans");
      return;
    }

    try {
      setApplyingClan(clanId);
      const response = await fetch(API_ENDPOINTS.CLANS.INVITE(clanId), {
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
      fetchClans(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error applying to clan");
    } finally {
      setApplyingClan(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredClans = clans.filter((clan) => {
    const matchesSearch =
      clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clan.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clan.description &&
        clan.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPremium = !filterPremium || clan.isPremium;

    return matchesSearch && matchesPremium;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-green-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Клануудыг ачааллаж байна...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg font-semibold mb-4">
                Алдаа гарлаа
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchClans}
                className="px-4 py-2 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors"
              >
                Дахин оролдох
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Кланууд
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Монголын шилдэг клануудтай нэгдэж, хамтдаа өсөн дэвжих
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Кланын нэр, тэг эсвэл тайлбараар хайх..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterPremium}
                    onChange={(e) => setFilterPremium(e.target.checked)}
                    className="w-4 h-4 text-purple-600 dark:text-green-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-green-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Premium кланууд
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Clans Grid */}
          {filteredClans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-12"
            >
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Клан олдсонгүй
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterPremium
                  ? "Хайлтын үр дүнд тохирох кланууд олдсонгүй"
                  : "Одоогоор кланууд байхгүй байна"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredClans.map((clan, index) => (
                <motion.div
                  key={clan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Clan Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={clan.logo || "/default-avatar.png"}
                          alt={clan.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {clan.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              [{clan.tag}]
                            </span>
                            {clan.isPremium && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {clan.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {clan.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {
                            (clan.members || []).filter(
                              (m) => m.status === "accepted"
                            ).length
                          }
                          /{clan.maxMembers}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(clan.createdAt)}</span>
                    </div>

                    {/* Leader */}
                    {clan.leader && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Image
                          src={clan.leader?.avatar || "/default-avatar.png"}
                          alt={clan.leader?.name || "Unknown Leader"}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {clan.leader?.name || "Unknown Leader"}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/clans/${clan._id}`}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Дэлгэрэнгүй</span>
                      </Link>
                      <button
                        onClick={() => handleApplyToClan(clan._id)}
                        disabled={applyingClan === clan._id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingClan === clan._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {applyingClan === clan._id
                            ? "Илгээж байна..."
                            : "Нэгдэх"}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
