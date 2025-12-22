"use client";

import { motion } from "framer-motion";
import { Plus, X, Crown, User } from "lucide-react";
import Image from "next/image";

const MemberAvatar = ({
  avatar,
  username,
}: {
  avatar?: string;
  username: string;
}) => {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={username}
        width={128}
        height={128}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
      <User className="w-12 h-12 text-gray-400" />
    </div>
  );
};

interface PartyMember {
  id: string;
  username: string;
  avatar: string;
  isLeader: boolean;
  level?: number;
}

interface PartyQueueProps {
  partyMembers: PartyMember[];
  onInvite: () => void;
  onRemoveMember: (memberId: string) => void;
  maxSlots?: number;
  onOpenInviteModal: () => void;
}

export default function PartyQueue({
  partyMembers,
  onInvite,
  onRemoveMember,
  maxSlots = 5,
  onOpenInviteModal,
}: PartyQueueProps) {
  const slots = Array.from({ length: maxSlots }, (_, i) => {
    return partyMembers[i] || null;
  });

  return (
    <div className="w-full max-w-5xl px-2 sm:px-4">
      {/* Mobile Layout: 3-2 Grid */}
      <div className="sm:hidden">
        {/* Top Row - 3 slots */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          {slots.slice(0, 3).map((member, index) => (
            <motion.div
              key={member?.id || `slot-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group flex-shrink-0"
            >
              {member ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 xs:w-32 xs:h-32 rounded-xl bg-gradient-to-br from-[#1e2433] to-[#252d3d] border-2 border-gray-700 hover:border-orange-500/50 transition-all duration-300 overflow-hidden">
                      <MemberAvatar
                        avatar={member.avatar}
                        username={member.username}
                      />
                    </div>

                    {member.isLeader && (
                      <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                        <Crown className="w-3 h-3 text-black" />
                      </div>
                    )}

                    {!member.isLeader && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveMember(member.id)}
                        className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 rounded-full p-1.5 shadow-lg"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    )}

                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1a1d29] px-2 py-0.5 rounded-full border border-orange-500/50">
                      <span className="text-xs text-orange-500 font-bold">
                        {member.level || 1}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-white font-medium text-xs xs:text-sm truncate max-w-[90px] xs:max-w-[110px]">
                      {member.username}
                    </p>
                    {member.isLeader && (
                      <p className="text-[10px] xs:text-xs text-yellow-500 font-semibold mt-0.5">
                        LEADER
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  onClick={onOpenInviteModal}
                  whileHover={{ scale: 1.05, borderColor: "rgb(249 115 22)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-28 h-28 xs:w-32 xs:h-32 rounded-xl bg-[#1a1d29]/50 border-2 border-dashed border-gray-700 hover:border-orange-500 transition-all duration-300 flex items-center justify-center cursor-pointer group"
                >
                  <Plus className="w-8 h-8 xs:w-10 xs:h-10 text-gray-600 group-hover:text-orange-500 transition-colors" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom Row - 2 slots */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {slots.slice(3, 5).map((member, index) => (
            <motion.div
              key={member?.id || `slot-${index + 3}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index + 3) * 0.1 }}
              className="relative group flex-shrink-0"
            >
              {member ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 xs:w-32 xs:h-32 rounded-xl bg-gradient-to-br from-[#1e2433] to-[#252d3d] border-2 border-gray-700 hover:border-orange-500/50 transition-all duration-300 overflow-hidden">
                      <MemberAvatar
                        avatar={member.avatar}
                        username={member.username}
                      />
                    </div>

                    {member.isLeader && (
                      <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                        <Crown className="w-3 h-3 text-black" />
                      </div>
                    )}

                    {!member.isLeader && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveMember(member.id)}
                        className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 rounded-full p-1.5 shadow-lg"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    )}

                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1a1d29] px-2 py-0.5 rounded-full border border-orange-500/50">
                      <span className="text-xs text-orange-500 font-bold">
                        {member.level || 1}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-white font-medium text-xs xs:text-sm truncate max-w-[90px] xs:max-w-[110px]">
                      {member.username}
                    </p>
                    {member.isLeader && (
                      <p className="text-[10px] xs:text-xs text-yellow-500 font-semibold mt-0.5">
                        LEADER
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  onClick={onOpenInviteModal}
                  whileHover={{ scale: 1.05, borderColor: "rgb(249 115 22)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-28 h-28 xs:w-32 xs:h-32 rounded-xl bg-[#1a1d29]/50 border-2 border-dashed border-gray-700 hover:border-orange-500 transition-all duration-300 flex items-center justify-center cursor-pointer group"
                >
                  <Plus className="w-8 h-8 xs:w-10 xs:h-10 text-gray-600 group-hover:text-orange-500 transition-colors" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tablet/Desktop Layout: Horizontal */}
      <div className="hidden sm:flex items-center justify-center gap-4 md:gap-6">
        {slots.map((member, index) => (
          <motion.div
            key={member?.id || `slot-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group flex-shrink-0"
          >
            {member ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#1e2433] to-[#252d3d] border-2 border-gray-700 hover:border-orange-500/50 transition-all duration-300 overflow-hidden">
                    <Image
                      src={member.avatar || "/default-avatar.png"}
                      alt={member.username}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {member.isLeader && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                      <Crown className="w-3 h-3 text-black" />
                    </div>
                  )}

                  {!member.isLeader && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemoveMember(member.id)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 rounded-full p-1.5 shadow-lg"
                    >
                      <X className="w-3 h-3 text-white" />
                    </motion.button>
                  )}

                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1a1d29] px-2 py-0.5 rounded-full border border-orange-500/50">
                    <span className="text-xs text-orange-500 font-bold">
                      {member.level || 1}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-white font-medium text-sm truncate max-w-[100px]">
                    {member.username}
                  </p>
                  {member.isLeader && (
                    <p className="text-xs text-yellow-500 font-semibold mt-0.5">
                      LEADER
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                onClick={onOpenInviteModal}
                whileHover={{ scale: 1.05, borderColor: "rgb(249 115 22)" }}
                whileTap={{ scale: 0.95 }}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-[#1a1d29]/50 border-2 border-dashed border-gray-700 hover:border-orange-500 transition-all duration-300 flex items-center justify-center cursor-pointer group"
              >
                <Plus className="w-8 h-8 text-gray-600 group-hover:text-orange-500 transition-colors" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
