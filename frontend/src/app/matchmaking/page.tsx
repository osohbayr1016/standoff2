"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, UserX, UserCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";
import PartyQueue from "./components/PartyQueue";
import InviteFriendsModal from "./components/InviteFriendsModal";
import InviteNotification from "./components/InviteNotification";

interface PartyMember {
  id: string;
  username: string;
  avatar: string;
  isLeader: boolean;
  level?: number;
}

interface Invite {
  id: string;
  from: {
    username: string;
    avatar: string;
    level: number;
  };
  partySize: number;
  expiresIn: number;
}

interface Notification {
  id: string;
  type: "accept" | "reject";
  username: string;
  message: string;
}

export default function MatchmakingPage() {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const estimatedTime = 90; // 01:30 in seconds
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([
    {
      id: "1",
      username: user?.username || "Player",
      avatar: user?.avatar || "/default-avatar.png",
      isLeader: true,
      level: user?.level || 1,
    },
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartSearch = () => {
    setIsSearching(true);
    setElapsedTime(0);
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setElapsedTime(0);
  };

  const handleOpenInviteModal = () => {
    if (partyMembers.length >= 5) return;
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = (friendId: string) => {
    // Simulate sending invite
    const invite: Invite = {
      id: Date.now().toString(),
      from: {
        username: user?.username || "Player",
        avatar: user?.avatar || "/default-avatar.png",
        level: user?.level || 1,
      },
      partySize: partyMembers.length,
      expiresIn: 60,
    };

    // For demo: Show invite notification after 2 seconds
    setTimeout(() => {
      setCurrentInvite(invite);
    }, 2000);
  };

  const handleAcceptInvite = (inviteId: string) => {
    if (partyMembers.length >= 5) return;

    const newMember: PartyMember = {
      id: Date.now().toString(),
      username: `Player${partyMembers.length + 1}`,
      avatar: "/default-avatar.png",
      isLeader: false,
      level: Math.floor(Math.random() * 50) + 1,
    };
    setPartyMembers([...partyMembers, newMember]);
    setCurrentInvite(null);

    // Show accept notification to leader
    setNotification({
      id: Date.now().toString(),
      type: "accept",
      username: newMember.username,
      message: `${newMember.username} joined the party`,
    });

    setTimeout(() => setNotification(null), 5000);
  };

  const handleRejectInvite = (inviteId: string) => {
    const rejectedUsername = currentInvite?.from.username || "Player";
    setCurrentInvite(null);

    // Show reject notification to leader
    setNotification({
      id: Date.now().toString(),
      type: "reject",
      username: rejectedUsername,
      message: `Player declined the invite`,
    });

    setTimeout(() => setNotification(null), 5000);
  };

  const handleRemoveMember = (memberId: string) => {
    setPartyMembers(partyMembers.filter((member) => member.id !== memberId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 relative overflow-hidden">
      {/* Invite Friends Modal */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleSendInvite}
      />

      {/* Invite Notification */}
      <InviteNotification
        invite={currentInvite}
        onAccept={handleAcceptInvite}
        onReject={handleRejectInvite}
      />

      {/* Leader Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-20 sm:top-24 left-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto"
          >
            <div
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl border-2 flex items-center gap-2 sm:gap-3 ${
                notification.type === "accept"
                  ? "bg-green-600 border-green-500"
                  : "bg-red-600 border-red-500"
              }`}
            >
              {notification.type === "accept" ? (
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              ) : (
                <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              )}
              <p className="text-white font-medium text-xs sm:text-sm">
                {notification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/sand-yards-map.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px) brightness(0.3)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[70vh] px-3 sm:px-4 gap-6 sm:gap-8 md:gap-12"
            >
              {/* Party Queue Section */}
              <div className="w-full flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
                <PartyQueue
                  partyMembers={partyMembers}
                  onInvite={handleOpenInviteModal}
                  onRemoveMember={handleRemoveMember}
                  maxSlots={5}
                  onOpenInviteModal={handleOpenInviteModal}
                />

                {/* Find Match Button */}
              <motion.button
                onClick={handleStartSearch}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-xs sm:max-w-sm px-8 sm:px-12 md:px-16 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-base sm:text-lg md:text-xl font-bold rounded-lg shadow-2xl transition-all duration-300 uppercase tracking-wider"
              >
                Find Match
              </motion.button>
              </div>

              {/* Match Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl mt-2 sm:mt-4">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full" />
                    <h3 className="text-white font-bold text-base sm:text-lg">
                      Standard Match
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">5v5</p>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      ✓ All party sizes
                    </p>
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      ✓ No Elo restrictions
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full" />
                    <h3 className="text-white font-bold text-base sm:text-lg">
                      Competitive Match
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">5v5</p>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      ✓ Solo, duo, trio
                    </p>
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      ✓ 400 Elo range
                    </p>
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      ✓ Verified matching
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] relative"
            >
              {/* Party Status Card - Hidden on mobile, shown on md screens */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:block absolute left-4 md:left-6 lg:left-8 top-6 md:top-8 bg-gradient-to-br from-[#1e2433]/95 to-[#252d3d]/95 backdrop-blur-md rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-700/50 shadow-2xl z-10"
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  <span className="text-xs md:text-sm font-medium">
                    {partyMembers.length}/{5} Players
                  </span>
                </div>
              </motion.div>

              {/* Main Search Area */}
              <div className="text-center px-4">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12"
                >
                  Searching for Match...
                </motion.h1>

                {/* Mobile Party Status - Shown only on mobile */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:hidden bg-gradient-to-br from-[#1e2433]/95 to-[#252d3d]/95 backdrop-blur-md rounded-lg p-2.5 sm:p-3 border border-gray-700/50 shadow-xl mb-4 sm:mb-6"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="text-xs sm:text-sm font-medium">
                      {partyMembers.length}/{5} Players
                    </span>
                  </div>
                </motion.div>

                {/* Radar Animation */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8">
                  {/* Orange Border */}
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/50" />

                  {/* Radar Background */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-900/40 to-green-950/60 backdrop-blur-sm overflow-hidden">
                    {/* Grid Lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="30%"
                        fill="none"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fill="none"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="70%"
                        fill="none"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <line
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2="100%"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke="rgba(74, 222, 128, 0.3)"
                        strokeWidth="1"
                      />
                    </svg>

                    {/* Scanning Line */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left" />
                    </motion.div>

                    {/* Scanning Dots */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-green-400 rounded-full"
                        style={{
                          top: `${30 + Math.random() * 40}%`,
                          left: `${30 + Math.random() * 40}%`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                      />
                    ))}
                  </div>

                  {/* Map Icon */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-orange-500">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
                    </svg>
                  </div>
                </div>

                {/* Timer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-sm sm:text-base text-gray-400">
                    Estimated Time: {formatTime(estimatedTime)}
                  </div>
                </motion.div>

                {/* Cancel Button */}
                <motion.button
                  onClick={handleCancelSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm sm:text-base rounded-lg border border-gray-600 transition-all duration-300 backdrop-blur-sm"
                >
                  Cancel Matchmaking
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
