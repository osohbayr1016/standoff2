"use client";

import { motion } from "framer-motion";
import {
  Users,
  Crown,
  Calendar,
  Settings,
  UserPlus,
  UserMinus,
} from "lucide-react";
import Image from "next/image";

interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  game: string;
  gameIcon: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
}

interface TeamProfileCardProps {
  team: Team;
  isOwner: boolean;
  onInvitePlayer?: () => void;
  onRemovePlayer?: (memberId: string) => void;
  onLeaveTeam?: () => void;
  onTeamSettings?: () => void;
}

export default function TeamProfileCard({
  team,
  isOwner,
  onInvitePlayer,
  onRemovePlayer,
  onLeaveTeam,
  onTeamSettings,
}: TeamProfileCardProps) {
  const acceptedMembers = team.members.filter(
    (member) => member.status === "accepted"
  );
  const pendingMembers = team.members.filter(
    (member) => member.status === "pending"
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {/* Team Header */}
      <div className="relative h-32 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <Image
                src={team.logo}
                alt={team.name}
                fill
                className="rounded-lg object-cover border-2 border-white"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white text-xl font-bold">
                  [{team.tag}] {team.name}
                </h3>
                {isOwner && <Crown className="w-5 h-5 text-yellow-400" />}
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <div className="w-4 h-4 relative">
                  <Image
                    src={team.gameIcon}
                    alt={team.game}
                    fill
                    className="rounded object-cover"
                  />
                </div>
                <span className="text-sm">{team.game}</span>
              </div>
            </div>
          </div>

          {isOwner && onInvitePlayer && (
            <motion.button
              onClick={onInvitePlayer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              title="Тоглогч урих"
            >
              <UserPlus className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Team Content */}
      <div className="p-6">
        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <Users className="w-6 h-6 text-purple-500 dark:text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {acceptedMembers.length}
            </div>
            <div className="text-sm text-gray-500">Гишүүд</div>
          </div>

          <div className="text-center">
            <Calendar className="w-6 h-6 text-purple-500 dark:text-green-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(team.createdAt)}
            </div>
            <div className="text-sm text-gray-500">Үүсгэсэн</div>
          </div>
        </div>

        {/* Accepted Members */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Багийн гишүүд
          </h4>
          <div className="space-y-2">
            {acceptedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      [{team.tag}] {member.name}
                    </div>
                    {member.id === team.createdBy && (
                      <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-green-400">
                        <Crown className="w-3 h-3" />
                        <span>Багийн дарга</span>
                      </div>
                    )}
                  </div>
                </div>

                {isOwner && member.id !== team.createdBy && onRemovePlayer && (
                  <motion.button
                    onClick={() => onRemovePlayer(member.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    title="Багаас гаргах"
                  >
                    <UserMinus className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {pendingMembers.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Хүлээгдэж буй урилга ({pendingMembers.length})
            </h4>
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={32}
                      height={32}
                      className="rounded-full opacity-60"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Урилга илгээсэн: {formatDate(member.invitedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                      Хүлээгдэж байна
                    </div>
                    {isOwner && onRemovePlayer && (
                      <motion.button
                        onClick={() => onRemovePlayer(member.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Урилгыг цуцлах"
                      >
                        <UserMinus className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {isOwner ? (
            <motion.button
              onClick={onTeamSettings}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Багийн тохиргоо</span>
            </motion.button>
          ) : (
            onLeaveTeam && (
              <motion.button
                onClick={onLeaveTeam}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <UserMinus className="w-4 h-4" />
                <span>Багаас гарах</span>
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
