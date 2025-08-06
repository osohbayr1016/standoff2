"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Gamepad2,
  Shield,
  Sword,
  Zap,
  Monitor,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../components/Navigation";
import ChatModal from "../components/ChatModal";
import { useAuth } from "../contexts/AuthContext";

interface Player {
  id: string;
  name: string;
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

// Game categories and their respective games
const gameCategories = {
  PC: [
    "Бүх PC Тоглоомууд",
    "Valorant",
    "Dota 2",
    "CS2",
    "Apex Legends",
    "PUBG",
    "Warcraft",
  ],
  Mobile: [
    "Бүх Mobile Тоглоомууд",
    "Mobile Legends",
    "Standoff 2",
    "PUBG Mobile",
  ],
};

// Roles for each game
const gameRoles = {
  Valorant: ["Бүх Үүргүүд", "Duelist", "Controller", "Initiator", "Sentinel"],
  "Dota 2": [
    "Бүх Үүргүүд",
    "Carry",
    "Mid",
    "Offlane",
    "Support",
    "Hard Support",
  ],
  CS2: ["Бүх Үүргүүд", "AWPer", "Rifler", "IGL", "Entry Fragger", "Lurker"],
  "Apex Legends": ["Бүх Үүргүүд", "Assault", "Recon", "Support", "Controller"],
  PUBG: ["Бүх Үүргүүд", "IGL", "Fragger", "Support", "Sniper"],
  Warcraft: ["Бүх Үүргүүд", "Tank", "DPS", "Healer", "Support"],
  "Mobile Legends": [
    "Бүх Үүргүүд",
    "Tank",
    "Fighter",
    "Assassin",
    "Mage",
    "Marksman",
    "Support",
  ],
  "Standoff 2": ["Бүх Үүргүүд", "AWPer", "Rifler", "IGL", "Entry Fragger"],
  "PUBG Mobile": ["Бүх Үүргүүд", "IGL", "Fragger", "Support", "Sniper"],
};

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"PC" | "Mobile">(
    "PC"
  );
  const [selectedGame, setSelectedGame] = useState("Бүх PC Тоглоомууд");
  const [selectedRole, setSelectedRole] = useState("Бүх Үүргүүд");
  const [loading, setLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Get available games for selected category
  const availableGames = gameCategories[selectedCategory];

  // Get available roles for selected game
  const availableRoles = gameRoles[selectedGame as keyof typeof gameRoles] || [
    "Бүх Үүргүүд",
  ];

  // Handle opening chat modal
  const handleOpenChat = (player: Player) => {
    if (!user) {
      // Redirect to login page or show login modal
      alert("Та чатлахын тулд нэвтэрх хэрэгтэй");
      return;
    }
    setSelectedPlayer(player);
    setIsChatModalOpen(true);
  };

  // Handle closing chat modal
  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedPlayer(null);
  };

  // Update selected game when category changes
  useEffect(() => {
    setSelectedGame(gameCategories[selectedCategory][0]);
    setSelectedRole("Бүх Үүргүүд");
  }, [selectedCategory]);

  // Update selected role when game changes
  useEffect(() => {
    setSelectedRole("Бүх Үүргүүд");
  }, [selectedGame]);

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5001/api/player-profiles/profiles"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        setPlayers(data.profiles || []);
      } catch {
        // Fallback to mock data if API fails
        setPlayers([
          {
            id: "1",
            name: "Баттулга",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            category: "PC",
            game: "Dota 2",
            role: "Carry",
            rank: "Divine",
            experience: "5+ жил",
            description: "Мэргэжлийн carry тоглогч, өрсөлдөөнт баг хайж байна",
            isLookingForTeam: true,
          },
          {
            id: "2",
            name: "Төмөөлэн",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            category: "PC",
            game: "CS2",
            role: "AWPer",
            rank: "Global Elite",
            experience: "3+ жил",
            description: "Сайн game sense-тэй чадвартай AWPer",
            isLookingForTeam: true,
          },
          {
            id: "3",
            name: "Ананд",
            avatar:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            category: "PC",
            game: "Valorant",
            role: "Duelist",
            rank: "Immortal",
            experience: "4+ жил",
            description: "Хүчтэй roaming боломжтой агрессив entry fragger",
            isLookingForTeam: false,
          },
          {
            id: "4",
            name: "Болд",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            category: "PC",
            game: "Apex Legends",
            role: "Assault",
            rank: "Diamond",
            experience: "2+ жил",
            description: "Сайн aim болон game sense-тэй assault legend",
            isLookingForTeam: true,
          },
          {
            id: "5",
            name: "Сарнай",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            category: "PC",
            game: "Dota 2",
            role: "Support",
            rank: "Ancient",
            experience: "6+ жил",
            description: "Хүчтэй map awareness-тэй туршлагатай support тоглогч",
            isLookingForTeam: true,
          },
          {
            id: "6",
            name: "Мөнх",
            avatar:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
            category: "PC",
            game: "CS2",
            role: "IGL",
            rank: "Legendary Eagle",
            experience: "7+ жил",
            description: "Сайн удирдлагын ур чадвартай стратеги IGL",
            isLookingForTeam: false,
          },
          {
            id: "7",
            name: "Энхжаргал",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
            category: "Mobile",
            game: "Mobile Legends",
            role: "Mage",
            rank: "Mythic",
            experience: "3+ жил",
            description: "Хүчтэй burst damage-тэй mage тоглогч",
            isLookingForTeam: true,
          },
          {
            id: "8",
            name: "Батбаяр",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            category: "Mobile",
            game: "Standoff 2",
            role: "AWPer",
            rank: "Legend",
            experience: "2+ жил",
            description: "Сайн aim-тэй mobile AWPer",
            isLookingForTeam: true,
          },
          {
            id: "9",
            name: "Ганбаатар",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            category: "Mobile",
            game: "PUBG Mobile",
            role: "IGL",
            rank: "Conqueror",
            experience: "4+ жил",
            description: "Сайн удирдлагын ур чадвартай mobile IGL",
            isLookingForTeam: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    let filtered = players;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (player.bio || player.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    filtered = filtered.filter(
      (player) => player.category === selectedCategory
    );

    // Filter by game
    if (selectedGame !== `Бүх ${selectedCategory} Тоглоомууд`) {
      filtered = filtered.filter((player) => player.game === selectedGame);
    }

    // Filter by role
    if (selectedRole !== "Бүх Үүргүүд") {
      filtered = filtered.filter((player) => player.role === selectedRole);
    }

    setFilteredPlayers(filtered);
  }, [players, searchTerm, selectedCategory, selectedGame, selectedRole]);

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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Find Your Perfect Player
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Бүх төрлийн тоглоом болон role бүрээс чадвартай тоглогчдыг ол.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
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

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as "PC" | "Mobile")
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="PC">PC Тоглоомууд</option>
                  <option value="Mobile">Mobile Тоглоомууд</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {getCategoryIcon(selectedCategory)}
                </div>
              </div>

              {/* Game Filter */}
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                {availableGames.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <p className="text-gray-600 dark:text-gray-300">
              Олдсон{" "}
              <span className="font-semibold text-purple-600 dark:text-green-400">
                {filteredPlayers.length}
              </span>{" "}
              тоглогч
            </p>
          </motion.div>

          {/* Players Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Player Header */}
                <div className="relative p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Image
                        src={player.avatar || "/default-avatar.png"}
                        alt={player.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {player.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(player.category)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {player.category}
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {player.game}
                        </span>
                        <span className="text-gray-300">•</span>
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
                  <div className="flex space-x-2 mt-4">
                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                      {player.rank}
                    </span>
                    {player.isLookingForTeam && (
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        Баг Хайж Байна
                      </span>
                    )}
                  </div>
                </div>

                {/* Player Details */}
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {player.bio ||
                      player.description ||
                      "No description available"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Туршлага: {player.experience}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link href={`/players/${player.id}`}>
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-200 transform hover:scale-105">
                        Профайл Харах
                      </button>
                    </Link>
                    <button
                      onClick={() => handleOpenChat(player)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Зурвас
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredPlayers.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Тоглогч олдсонгүй
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Хайлтын нөхцөл эсвэл шүүлтүүрээ тохируулна уу
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Chat Modal */}
      {selectedPlayer && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={handleCloseChat}
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.name}
          playerAvatar={selectedPlayer.avatar}
        />
      )}
    </div>
  );
}
