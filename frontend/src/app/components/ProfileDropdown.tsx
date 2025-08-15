"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Settings,
  Users,
  UserPlus,
  ChevronDown,
  Eye,
  UserMinus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

interface ProfileDropdownProps {
  onCreateTeam: () => void;
  onInviteFriend: () => void;
}

export default function ProfileDropdown({
  onCreateTeam,
  onInviteFriend,
}: ProfileDropdownProps) {
  const { user, hasProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user team from localStorage
  useEffect(() => {
    const loadUserTeam = () => {
      const savedTeam = localStorage.getItem("userTeam");
      if (savedTeam) {
        try {
          setUserTeam(JSON.parse(savedTeam));
        } catch (error) {
          console.error("Error parsing saved team:", error);
          setUserTeam(null);
        }
      } else {
        setUserTeam(null);
      }
    };

    loadUserTeam();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      loadUserTeam();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for manual updates (custom event)
    window.addEventListener("teamUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("teamUpdated", handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (callback?: () => void) => {
    setIsOpen(false);
    if (callback) {
      callback();
    }
  };

  const handleViewTeam = () => {
    handleItemClick();
    // Navigate to settings page with team tab active
    window.location.href = "/settings#team";
  };

  const handleLeaveTeam = () => {
    if (userTeam && user) {
      // Check if user is team owner
      if (userTeam.createdBy === user.id) {
        alert(
          "Та багийн дарга учир багийг орхих боломжгүй. Эхлээд багаа устгана уу."
        );
        return;
      }

      // Remove user from team
      const updatedTeam = {
        ...userTeam,
        members: userTeam.members.filter((member) => member.id !== user.id),
      };

      // If no members left, delete the team
      if (updatedTeam.members.length === 0) {
        localStorage.removeItem("userTeam");
        setUserTeam(null);
      } else {
        localStorage.setItem("userTeam", JSON.stringify(updatedTeam));
        setUserTeam(null); // User is no longer part of the team
      }

      // Trigger update event
      window.dispatchEvent(new Event("teamUpdated"));
    }
    handleItemClick();
  };

  // Check if user is in a team
  const isInTeam =
    userTeam &&
    user &&
    userTeam.members.some(
      (member) => member.id === user.id && member.status === "accepted"
    );

  // Check if user is team owner
  const isTeamOwner = userTeam && user && userTeam.createdBy === user.id;

  const getProfileLink = () => {
    if (user?.role === "PLAYER" && hasProfile) return "/profile";
    if (user?.role === "ORGANIZATION" && hasProfile)
      return "/organization-profile";
    if (user?.role === "PLAYER") return "/create-profile";
    return "/create-organization-profile";
  };

  const getProfileTitle = () => {
    if (user?.role === "PLAYER" && hasProfile) return "Профайл";
    if (user?.role === "ORGANIZATION" && hasProfile)
      return "Байгууллагын профайл";
    if (user?.role === "PLAYER") return "Профайл үүсгэх";
    return "Байгууллагын профайл үүсгэх";
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || "Profile"}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <User className="w-5 h-5" />
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || "Profile"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {user.name || "Хэрэглэгч"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Profile */}
              <Link href={getProfileLink()}>
                <motion.button
                  onClick={() => handleItemClick()}
                  whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.1)" }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {getProfileTitle()}
                  </span>
                </motion.button>
              </Link>

              {/* Settings */}
              <Link href="/settings">
                <motion.button
                  onClick={() => handleItemClick()}
                  whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.1)" }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Тохиргоо</span>
                </motion.button>
              </Link>

              {/* Team Management - Only for players */}
              {user.role === "PLAYER" && (
                <>
                  {isInTeam ? (
                    <>
                      {/* View Team */}
                      <motion.button
                        onClick={handleViewTeam}
                        whileHover={{
                          backgroundColor: "rgba(124, 58, 237, 0.1)",
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Баг үзэх</span>
                      </motion.button>

                      {/* Leave Team - Only if not team owner */}
                      {!isTeamOwner && (
                        <motion.button
                          onClick={handleLeaveTeam}
                          whileHover={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Багаас гарах
                          </span>
                        </motion.button>
                      )}
                    </>
                  ) : (
                    /* Create Team */
                    <motion.button
                      onClick={() => handleItemClick(onCreateTeam)}
                      whileHover={{
                        backgroundColor: "rgba(124, 58, 237, 0.1)",
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Баг үүсгэх</span>
                    </motion.button>
                  )}
                </>
              )}

              {/* Invite Friend */}
              <motion.button
                onClick={() => handleItemClick(onInviteFriend)}
                whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.1)" }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Найзаа урих</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
