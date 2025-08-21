"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Check, X, Clock, User } from "lucide-react";
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
  id: string;
  name: string;
  tag: string;
  description?: string;
  logo?: string;
  leader: {
    id: string;
    name: string;
    avatar: string;
  };
  members: ClanMember[];
  maxMembers: number;
  isPremium: boolean;
  createdAt: string;
}

export default function ClanInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CLANS.USER_INVITATIONS, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }

      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (clanId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CLANS.ACCEPT(clanId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      // Remove the accepted invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.id !== clanId));

      // You can add a success notification here
      console.log("Invitation accepted successfully");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setError("Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (clanId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CLANS.DECLINE(clanId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to decline invitation");
      }

      // Remove the declined invitation from the list
      setInvitations((prev) => prev.filter((inv) => inv.id !== clanId));

      // You can add a success notification here
      console.log("Invitation declined successfully");
    } catch (error) {
      console.error("Error declining invitation:", error);
      setError("Failed to decline invitation");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                Please log in to view clan invitations.
              </p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Кланын урилгууд
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Таныг урьсан клануудын жагсаалт
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-green-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Урилгуудыг ачааллаж байна...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : invitations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Урилга байхгүй
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Одоогоор таныг урьсан кланууд байхгүй байна.
                </p>
                <Link
                  href="/players"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  <span>Тоглогчдыг харах</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {invitations.map((clan, index) => (
                <motion.div
                  key={clan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Clan Logo */}
                      <div className="relative flex-shrink-0">
                        <Image
                          src={clan.logo || "/default-avatar.png"}
                          alt={clan.name}
                          width={80}
                          height={80}
                          className="rounded-xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                        />
                        {clan.isPremium && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                            <Crown className="w-4 h-4 text-yellow-800" />
                          </div>
                        )}
                      </div>

                      {/* Clan Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            [{clan.tag}]
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {clan.name}
                          </h3>
                        </div>

                        {clan.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {clan.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {
                                clan.members.filter(
                                  (m) => m.status === "accepted"
                                ).length
                              }
                              /{clan.maxMembers} гишүүд
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Урилсан: {formatDate(clan.createdAt)}</span>
                          </div>
                        </div>

                        {/* Clan Leader */}
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Удирдагч:
                          </span>
                          <div className="flex items-center space-x-2">
                            <Image
                              src={clan.leader.avatar || "/default-avatar.png"}
                              alt={clan.leader.name}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {clan.leader.name}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAcceptInvitation(clan.id)}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>Зөвшөөрөх</span>
                          </button>
                          <button
                            onClick={() => handleDeclineInvitation(clan.id)}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Татгалзах</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
