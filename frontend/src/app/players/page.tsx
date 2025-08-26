"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Monitor, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../components/Navigation";
import ScrollReveal from "../components/ScrollReveal";

import { API_ENDPOINTS } from "@/config/api";

interface Player {
  id: string;
  name: string;
  realName?: string;
  avatar?: string;
  avatarPublicId?: string;
  category: "PC" | "Mobile";
  game: string;
  role: string;
  inGameName?: string;
  rank: string;
  experience: string;
  bio?: string;
  description?: string;
  isLookingForTeam: boolean;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
    website?: string;
  };
  highlightVideo?: string;
}

const gameData = {
  Mobile: [
    {
      id: "mobile-legends",
      name: "Mobile Legends",
      image: "https://i.redd.it/op52fca67y9c1.jpeg",
      route: "/games/mobile-legends",
      playerCount: 0,
    },
  ],
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Mobile">("Mobile");
  const [loading, setLoading] = useState(true);
  const [gameDataState, setGameDataState] = useState(gameData);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.ALL);

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        console.log("API Response:", data);
        setPlayers(data.profiles || []);
      } catch (error) {
        console.error("Error fetching players:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const updatedGameData = { ...gameData };

    Object.keys(updatedGameData).forEach((category) => {
      updatedGameData[category as keyof typeof gameData].forEach((game) => {
        const count = players.filter(
          (player) => player.game === game.name
        ).length;
        game.playerCount = count;
      });
    });

    setGameDataState(updatedGameData);
  }, [players]);

  const getCategoryIcon = (category: "PC" | "Mobile") => {
    return category === "PC" ? (
      <Monitor className="w-4 h-4" />
    ) : (
      <Smartphone className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-green-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Loading players...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Find Your Perfect Player
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Бүх төрлийн тоглоом болон role бүрээс чадвартай тоглогчдыг ол.
            </p>
          </ScrollReveal>

          <ScrollReveal className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Тоглогчдыг хайх..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Mobile Legends
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {gameDataState[selectedCategory].map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group"
                >
                  <Link href={game.route}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105">
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center p-1">
                            <Image
                              src={game.image}
                              alt={game.name}
                              width={120}
                              height={120}
                              className="object-contain w-full h-full drop-shadow-lg"
                              unoptimized={true}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="text-center">
                                      <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                      </svg>
                                      <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">${game.name}</p>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg backdrop-blur-sm">
                              {game.playerCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                          {game.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {game.playerCount} тоглогч
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
