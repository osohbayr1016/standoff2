"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Edit, User } from "lucide-react";

interface ProfileHeaderProps {
  avatar?: string;
  nickname: string;
  lastEdited?: string;
  elo: number;
  uniqueId?: string;
  onEditClick?: () => void;
  hideEditButton?: boolean;
}

export default function ProfileHeader({
  avatar,
  nickname,
  lastEdited,
  elo,
  uniqueId,
  onEditClick,
  hideEditButton = false,
}: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={nickname}
              width={120}
              height={140}
              className="rounded-xl object-cover border-2 border-orange-500/30"
            />
          ) : (
            <div className="w-[120px] h-[140px] rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-500" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <p className="text-gray-400 text-sm">Nickname:</p>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {nickname}
            </h1>
            {onEditClick && !hideEditButton && (
              <button
                onClick={onEditClick}
                className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-gray-400 hover:text-orange-500" />
              </button>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-2">
            Last edited: {lastEdited || "Never"}
          </p>
        </div>

        {/* ELO Section */}
        <div className="text-center md:text-right md:border-l md:border-gray-700 md:pl-8">
          <p className="text-gray-400 text-sm mb-1">Current ELO:</p>
          <p className="text-5xl md:text-6xl font-bold text-orange-500">
            {elo}
          </p>
        </div>

        {/* Find Match Button */}
        <div className="flex items-center">
          <Link
            href="/matchmaking"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors duration-200 whitespace-nowrap"
          >
            Find Match
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
