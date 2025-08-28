"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users, ArrowLeft, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import ChatModal from "../../components/ChatModal";
import PlayerCard from "../../components/PlayerCard";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "@/config/api";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  avatarPublicId?: string;
  category: "PC" | "Mobile";
  game: string;
  roles: string[];
  inGameName?: string;
  rank: string;
  rankStars?: number;
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



// Game information (MLBB only)
const gameInfo = {
  "mobile-legends": {
    name: "Mobile Legends",
    category: "Mobile" as const,
    description: "Mobile MOBA game",
    roles: ["Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support"],
    ranks: [
      "Warrior",
      "Elite",
      "Master",
      "Grandmaster",
      "Epic",
      "Legend",
      "Mythic",
      "Mythical Glory",
      "+Mythical Immortal",
    ],
  },
};

export default function GamePage() {
  const params = useParams();
  const gameId = params.game as string;
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("Бүх Үүргүүд");
  const [selectedRank, setSelectedRank] = useState("Бүх Ранкууд");
  const [minStars, setMinStars] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"stars" | "name" | "rank">("name");
  const [loading, setLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const game = gameInfo[gameId as keyof typeof gameInfo];

  // Handle opening chat modal
  const handleOpenChat = (player: Player) => {
    if (!user) {
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

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.ALL);

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        const allPlayers = data.profiles || [];

        console.log('🔍 All players from API:', allPlayers);
        console.log('🎮 Looking for game:', game.name);
        console.log('🎮 Game ID from URL:', gameId);

        // Validate and filter players for this specific game
        const gamePlayers = allPlayers
          .filter((player: Partial<Player>) => {
            // Ensure player has required properties
            const hasRequiredProps = player && 
                   player.name && 
                   typeof player.name === 'string';
            
            if (!hasRequiredProps) {
              console.log('❌ Player missing required props:', player);
              return false;
            }

            // Check if player matches this game (case-insensitive and flexible matching)
            const playerGame = player.game || '';
            const gameName = game.name || '';
            const gameIdLower = gameId.toLowerCase();
            
            const matchesGame = playerGame.toLowerCase().includes(gameIdLower) ||
                               gameName.toLowerCase().includes(playerGame.toLowerCase()) ||
                               playerGame.toLowerCase().includes('mobile') ||
                               playerGame.toLowerCase().includes('legends');
            
            console.log(`🎮 Player "${player.name}" game: "${playerGame}" matches "${gameName}": ${matchesGame}`);
            
            return matchesGame;
          })
          .map((player: Partial<Player>): Player => ({
            id: player.id || '',
            name: player.name || 'Unknown Player',
            avatar: player.avatar,
            avatarPublicId: player.avatarPublicId,
            category: player.category || 'Mobile',
            game: player.game || game.name,
            roles: Array.isArray(player.roles) ? player.roles : [],
            inGameName: player.inGameName,
            rank: player.rank || 'Unknown',
            rankStars: player.rankStars,
            experience: player.experience || 'Unknown',
            bio: player.bio,
            description: player.description,
            isLookingForTeam: Boolean(player.isLookingForTeam),
            socialLinks: player.socialLinks,
            highlightVideo: player.highlightVideo
          }));

        console.log(`✅ Found ${gamePlayers.length} valid players for ${game.name}:`, gamePlayers);
        
        // If no players found for this specific game, show all players for debugging
        if (gamePlayers.length === 0 && allPlayers.length > 0) {
          console.log('⚠️ No players found for specific game, showing all players for debugging');
          const allValidPlayers = allPlayers
            .filter((player: Partial<Player>) => player && player.name && typeof player.name === 'string')
            .map((player: Partial<Player>): Player => ({
              id: player.id || '',
              name: player.name || 'Unknown Player',
              avatar: player.avatar,
              avatarPublicId: player.avatarPublicId,
              category: player.category || 'Mobile',
              game: player.game || 'Unknown',
              roles: Array.isArray(player.roles) ? player.roles : [],
              inGameName: player.inGameName,
              rank: player.rank || 'Unknown',
              rankStars: player.rankStars,
              experience: player.experience || 'Unknown',
              bio: player.bio,
              description: player.description,
              isLookingForTeam: Boolean(player.isLookingForTeam),
              socialLinks: player.socialLinks,
              highlightVideo: player.highlightVideo
            }));
          console.log('🔍 All valid players (for debugging):', allValidPlayers);
          setPlayers(allValidPlayers);
        } else {
          setPlayers(gamePlayers);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    if (game) {
      fetchPlayers();
    }
  }, [game, gameId]);

  // Filter and sort players
  useEffect(() => {
    let filtered = players;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (player) => {
          const playerName = player.name || '';
          const playerBio = player.bio || player.description || '';
          const searchLower = searchTerm.toLowerCase();
          
          return playerName.toLowerCase().includes(searchLower) ||
                 playerBio.toLowerCase().includes(searchLower);
        }
      );
    }

    // Filter by role
    if (selectedRole !== "Бүх Үүргүүд") {
      filtered = filtered.filter((player) => {
        const playerRoles = player.roles || [];
        return Array.isArray(playerRoles) && playerRoles.includes(selectedRole);
      });
    }

    // Filter by rank
    if (selectedRank !== "Бүх Ранкууд") {
      filtered = filtered.filter((player) => {
        const playerRank = player.rank || '';
        return playerRank === selectedRank;
      });
    }

    // Filter by minimum stars for Mythical Glory
    if (minStars !== null && minStars > 0) {
      filtered = filtered.filter((player) => {
        const playerRank = player.rank || '';
        const playerStars = player.rankStars || 0;
        
        if (playerRank === "Mythical Glory" && playerStars > 0) {
          return playerStars >= minStars;
        }
        return true; // Include players with other ranks
      });
    }

    // Sort players with error handling
    try {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "stars":
            // Sort by stars (highest first), then by rank
            const aRank = a.rank || '';
            const bRank = b.rank || '';
            const aStars = aRank === "Mythical Glory" ? (a.rankStars || 0) : 0;
            const bStars = bRank === "Mythical Glory" ? (b.rankStars || 0) : 0;
            if (aStars !== bStars) {
              return bStars - aStars; // Higher stars first
            }
            // If same stars, sort by rank
            return getRankValue(bRank) - getRankValue(aRank);

          case "rank":
            // Sort by rank (highest first)
            const aRankForSort = a.rank || '';
            const bRankForSort = b.rank || '';
            return getRankValue(bRankForSort) - getRankValue(aRankForSort);

          case "name":
          default:
            // Sort by name alphabetically with null safety
            const aName = a.name || '';
            const bName = b.name || '';
            return aName.localeCompare(bName);
        }
      });
    } catch (error) {
      console.error('Error sorting players:', error);
      // If sorting fails, keep original order
      console.log('Keeping original player order due to sorting error');
    }

    setFilteredPlayers(filtered);
  }, [players, searchTerm, selectedRole, selectedRank, minStars, sortBy]);

  // Helper function to get rank value for sorting
  const getRankValue = (rank: string): number => {
    const rankValues: { [key: string]: number } = {
      Warrior: 1,
      Elite: 2,
      Master: 3,
      Grandmaster: 4,
      Epic: 5,
      Legend: 6,
      Mythic: 7,
      "Mythical Glory": 8,
      "+Mythical Immortal": 9,
    };
    return rankValues[rank] || 0;
  };

  const getCategoryIcon = (category: "PC" | "Mobile") => {
    return category === "PC" ? (
      <Monitor className="w-4 h-4" />
    ) : (
      <Smartphone className="w-4 h-4" />
    );
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Game not found
              </h1>
              <Link
                href="/players"
                className="text-purple-600 dark:text-green-400 hover:underline"
              >
                Back to Players
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-green-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Loading {game.name} players...
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
            className="mb-8"
          >
            <Link
              href="/players"
              className="inline-flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Players</span>
            </Link>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
                {game.name}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
                {game.description}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  {getCategoryIcon(game.category)}
                  <span>{game.category}</span>
                </div>
                <span>•</span>
                <span>{players.length} тоглогч</span>
              </div>
            </div>
          </motion.div>

          {/* Debug Section - Remove after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6"
            >
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🐛 Debug Info (Development Only)
              </h3>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <p><strong>Game ID:</strong> {gameId}</p>
                <p><strong>Game Name:</strong> {game.name}</p>
                <p><strong>Total Players:</strong> {players.length}</p>
                <p><strong>Filtered Players:</strong> {filteredPlayers.length}</p>
                <p><strong>Search Term:</strong> &quot;{searchTerm}&quot;</p>
                <p><strong>Selected Role:</strong> {selectedRole}</p>
                <p><strong>Selected Rank:</strong> {selectedRank}</p>
                <p><strong>Sort By:</strong> {sortBy}</p>
              </div>
            </motion.div>
          )}

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
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

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Бүх Үүргүүд">Бүх Үүргүүд</option>
                {game.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {/* Rank Filter */}
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Бүх Ранкууд">Бүх Ранкууд</option>
                {game.ranks.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>

              {/* Star Counter Filter (only show when Mythical Glory is selected) */}
              {selectedRank === "Mythical Glory" && (
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Мин. Од"
                    min="1"
                    max="999"
                    value={minStars || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMinStars(value ? parseInt(value) : null);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ⭐
                  </div>
                </div>
              )}

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "stars" | "name" | "rank")
                }
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="name">Нэрээр эрэмбэлэх</option>
                <option value="rank">Ранкаар эрэмбэлэх</option>
                <option value="stars">Одоор эрэмбэлэх</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm ||
              selectedRole !== "Бүх Үүргүүд" ||
              selectedRank !== "Бүх Ранкууд" ||
              minStars !== null) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRole("Бүх Үүргүүд");
                    setSelectedRank("Бүх Ранкууд");
                    setMinStars(null);
                    setSortBy("name");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  Шүүлтүүрүүдийг цэвэрлэх
                </button>
              </div>
            )}
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-gray-600 dark:text-gray-300">
                Олдсон{" "}
                <span className="font-semibold text-purple-600 dark:text-green-400">
                  {filteredPlayers.length}
                </span>{" "}
                тоглогч
              </p>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2 text-sm">
                {selectedRank === "Mythical Glory" && minStars !== null && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                    ⭐ {minStars}+ одтой Mythical Glory
                  </span>
                )}
                {sortBy === "stars" && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    Одоор эрэмбэлэгдсэн
                  </span>
                )}
                {sortBy === "rank" && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                    Ранкаар эрэмбэлэгдсэн
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Players Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredPlayers.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                index={index}
                onOpenChat={handleOpenChat}
              />
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
