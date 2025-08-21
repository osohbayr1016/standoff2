"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  LogOut,
  Calendar,
  Tag,
} from "lucide-react";
import Image from "next/image";
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
  leader: string;
  members: ClanMember[];
  maxMembers: number;
  isPremium: boolean;
  createdAt: string;
  memberCount?: number;
  pendingInvitesCount?: number;
}

interface ClanProfileCardProps {
  clan: Clan;
  isOwner: boolean;
  onRemovePlayer?: (memberId: string) => void;
  onLeaveClan?: () => void;
  onClanSettings?: () => void;
}

export default function ClanProfileCard({
  clan,
  isOwner,
  onRemovePlayer,
  onLeaveClan,
  onClanSettings,
}: ClanProfileCardProps) {
  const [loading, setLoading] = useState(false);

  const acceptedMembers = clan.members.filter((m) => m.status === "accepted");
  const pendingMembers = clan.members.filter((m) => m.status === "pending");

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemovePlayer) return;

    setLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.CLANS.REMOVE_MEMBER(clan.id, memberId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        onRemovePlayer(memberId);
      } else {
        console.error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClan = async () => {
    if (!onLeaveClan) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.CLANS.LEAVE(clan.id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        onLeaveClan();
      } else {
        console.error("Failed to leave clan");
      }
    } catch (error) {
      console.error("Error leaving clan:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Clan Header */}
      <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={clan.logo || "/default-avatar.png"}
              alt={clan.name}
              width={80}
              height={80}
              className="rounded-xl object-cover border-4 border-white/20"
            />
            {clan.isPremium && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                <Crown className="w-4 h-4 text-yellow-800" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                [{clan.tag}]
              </span>
              <h2 className="text-2xl font-bold text-white">{clan.name}</h2>
            </div>
            <div className="flex items-center space-x-4 text-white/90">
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
        </div>
      </div>

      {/* Clan Description */}
      {clan.description && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {clan.description}
          </p>
        </div>
      )}

      {/* Clan Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-green-400">
              {acceptedMembers.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Гишүүд
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {pendingMembers.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Урилга
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {clan.maxMembers}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Хязгаар
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Гишүүд ({acceptedMembers.length})
        </h3>
        <div className="space-y-3">
          {acceptedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </span>
                    {member.id === clan.leader && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  {member.joinedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Нэгдсэн: {formatDate(member.joinedAt)}
                    </p>
                  )}
                </div>
              </div>
              {isOwner && member.id !== clan.leader && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={loading}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Гишүүнийг хасах"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pending Invitations */}
        {pendingMembers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Хүлээгдэж буй урилгууд ({pendingMembers.length})
            </h3>
            <div className="space-y-3">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Урилсан: {formatDate(member.invitedAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                    Хүлээгдэж байна
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 dark:bg-gray-700">
        <div className="flex space-x-3">
          {isOwner ? (
            <>
              <button
                onClick={onClanSettings}
                className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 dark:bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Тохиргоо</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLeaveClan}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Кланаас гарах</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
