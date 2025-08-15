"use client";

import { motion } from "framer-motion";
import {
  Gamepad2,
  Shield,
  Sword,
  Zap,
  Monitor,
  Smartphone,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  category: "PC" | "Mobile";
  game: string;
  role: string;
  rank: string;
  experience: string;
  isLookingForTeam: boolean;
}

interface PlayerCardProps {
  player: Player;
  index: number;
  canInvitePlayers: boolean;
  isPlayerInTeamOrInvited: (playerId: string) => boolean;
  playersTeamTags: Record<string, string>;
  onInviteToTeam: (player: Player) => void;
  onOpenChat: (player: Player) => void;
}

export default function PlayerCard({
  player,
  index,
  canInvitePlayers,
  isPlayerInTeamOrInvited,
  playersTeamTags,
  onInviteToTeam,
  onOpenChat,
}: PlayerCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Carry":
      case "Duelist":
      case "Assault":
      case "Fighter":
        return <Sword className="w-4 h-4" />;
      case "Support":
      case "Hard Support":
      case "Sentinel":
        return <Shield className="w-4 h-4" />;
      case "Mid":
      case "Mage":
      case "Initiator":
        return <Zap className="w-4 h-4" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: "PC" | "Mobile") => {
    return category === "PC" ? (
      <Monitor className="w-4 h-4" />
    ) : (
      <Smartphone className="w-4 h-4" />
    );
  };

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Player Header */}
      <div className="relative p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-shrink-0">
            <Image
              src={player.avatar || "/default-avatar.png"}
              alt={player.name}
              width={64}
              height={64}
              className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              {playersTeamTags[player.id] && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-2 py-1 rounded text-sm font-bold shadow-lg">
                  [{playersTeamTags[player.id]}]
                </span>
              )}
              <span>{player.name}</span>
            </h3>
            <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1 flex-wrap gap-1">
              <div className="flex items-center space-x-1">
                {getCategoryIcon(player.category)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {player.category}
                </span>
              </div>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1">
                {getRoleIcon(player.role)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {player.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
          <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
            {player.rank}
          </span>
          {player.isLookingForTeam && (
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Баг Хайж Байна
            </span>
          )}
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Тоглоом
            </h4>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {player.game}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Туршлага
            </h4>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {player.experience}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={`/players/${player.id}`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-200 transform hover:scale-105 text-sm">
              Профайл Харах
            </button>
          </Link>

          {/* Team Invite Button - Only show for team owners */}
          {canInvitePlayers && (
            <button
              onClick={() => onInviteToTeam(player)}
              disabled={isPlayerInTeamOrInvited(player.id)}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-1 text-sm flex-shrink-0 ${
                isPlayerInTeamOrInvited(player.id)
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transform hover:scale-105"
              }`}
              title={
                isPlayerInTeamOrInvited(player.id)
                  ? "Тоглогч багт орсон"
                  : "Багт урих"
              }
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isPlayerInTeamOrInvited(player.id) ? "Багт орсон" : "Урих"}
              </span>
            </button>
          )}

          <button
            onClick={() => onOpenChat(player)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm flex-shrink-0"
          >
            Зурвас
          </button>
        </div>
      </div>
    </motion.div>
  );
}
