"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/profile");
  };

  // Main navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Matchmaking", href: "/matchmaking" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Rewards", href: "/rewards" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f1419] via-[#1a1d29] to-[#0f1419] backdrop-blur-md border-b border-orange-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold tracking-tight"
            >
              <span className="text-white">STAND</span>
              <span className="text-orange-500">OFF</span>
              <span className="text-white"> 2</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-orange-500/10 transition-all duration-200 font-medium text-sm"
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Side - User Profile or Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-500 hover:to-orange-400 transition-all duration-300 shadow-lg"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-white font-medium">{user.name}</span>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-[#1a1d29] rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {user.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <motion.button
                          whileHover={{
                            backgroundColor: "rgba(249, 115, 22, 0.1)",
                          }}
                          onClick={handleProfileClick}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-white rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </motion.button>
                        <motion.button
                          whileHover={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                          }}
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 transition-all duration-300 shadow-lg font-medium"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t border-gray-800">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors font-medium"
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}

                {/* Mobile User Actions */}
                <div className="pt-4 border-t border-gray-800 space-y-2">
                  {user ? (
                    <>
                      <motion.button
                        onClick={handleProfileClick}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </motion.button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white text-center font-medium"
                      >
                        Login
                      </motion.div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
