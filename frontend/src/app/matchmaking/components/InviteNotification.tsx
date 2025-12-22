"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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

interface InviteNotificationProps {
  invite: Invite | null;
  onAccept: (inviteId: string) => void;
  onReject: (inviteId: string) => void;
}

export default function InviteNotification({
  invite,
  onAccept,
  onReject,
}: InviteNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(invite?.expiresIn || 60);

  useEffect(() => {
    if (!invite) return;

    setTimeLeft(invite.expiresIn);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onReject(invite.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [invite, onReject]);

  return (
    <AnimatePresence>
      {invite && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -100, x: "-50%" }}
          className="fixed top-20 sm:top-24 left-1/2 z-[100] w-[calc(100%-2rem)] sm:w-full max-w-md"
        >
          <div className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-lg sm:rounded-xl shadow-2xl border-2 border-orange-500 overflow-hidden">
            <div className="bg-orange-600 px-3 sm:px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-white font-semibold text-xs sm:text-sm">
                  Party Invite
                </span>
              </div>
              <span className="text-white text-xs font-mono">{timeLeft}s</span>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <Image
                  src={invite.from.avatar}
                  alt={invite.from.username}
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-orange-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-base sm:text-lg truncate">
                    {invite.from.username}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Level {invite.from.level} • {invite.partySize}/5 in party
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
                has invited you to join their matchmaking party
              </p>

              <div className="flex gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAccept(invite.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  Accept
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReject(invite.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-colors text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Reject
                </motion.button>
              </div>
            </div>

            <div className="h-1 bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: invite.expiresIn, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
