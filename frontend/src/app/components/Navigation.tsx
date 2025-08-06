"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { Sun, Moon, Menu, X, Search, Bell, User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
  const { isDarkMode, toggleDarkMode, isLoaded } = useDarkMode();
  const { user, logout, hasProfile } = useAuth();
  const { isConnected } = useSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Нүүр", href: "/" },
    { name: "Тоглогчид", href: "/players" },
    { name: "Бидний тухай", href: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent transition-all duration-300"
            >
              E-Sport Connection
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            {/* Connection Status Indicator */}
            {user && (
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isLoaded && (
                <motion.button
                  key={isDarkMode ? "dark" : "light"}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={toggleDarkMode}
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-green-400"
                  title={
                    isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={
                    user.role === "PLAYER" && hasProfile
                      ? "/profile"
                      : user.role === "ORGANIZATION" && hasProfile
                      ? "/organization-profile"
                      : user.role === "PLAYER"
                      ? "/create-profile"
                      : "/create-organization-profile"
                  }
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    title={
                      user.role === "PLAYER" && hasProfile
                        ? "Profile"
                        : user.role === "ORGANIZATION" && hasProfile
                        ? "Organization Profile"
                        : user.role === "PLAYER"
                        ? "Create Profile"
                        : "Create Organization Profile"
                    }
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </motion.button>
                </Link>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Гарах"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Actions */}
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5" />
                  </motion.button>

                  <AnimatePresence mode="wait">
                    {isLoaded && (
                      <motion.button
                        key={isDarkMode ? "dark-mobile" : "light-mobile"}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={toggleDarkMode}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        {isDarkMode ? (
                          <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Moon className="w-5 h-5 text-gray-600" />
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile User Actions */}
                {user ? (
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={
                        user.role === "PLAYER" && hasProfile
                          ? "/profile"
                          : "/create-profile"
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                    >
                      <User className="w-5 h-5" />
                      <span>
                        {user.role === "PLAYER" && hasProfile
                          ? "Profile"
                          : "Create Profile"}
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Гарах</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                    >
                      Нэвтрэх
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
