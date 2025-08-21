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
import { Clan } from "../../../types/clan";

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

// Game information
const gameInfo = {
  valorant: {
    name: "Valorant",
    category: "PC" as const,
    description: "5v5 tactical shooter game",
    roles: ["Duelist", "Controller", "Initiator", "Sentinel"],
    ranks: [
      "Iron",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Ascendant",
      "Immortal",
      "Radiant",
    ],
  },
  dota2: {
    name: "Dota 2",
    category: "PC" as const,
    description: "Multiplayer online battle arena",
    roles: ["Carry", "Support", "Mid", "Offlane", "Hard Support"],
    ranks: [
      "Herald",
      "Guardian",
      "Crusader",
      "Archon",
      "Legend",
      "Ancient",
      "Divine",
      "Immortal",
    ],
  },
  cs2: {
    name: "CS2",
    category: "PC" as const,
    description: "First-person tactical shooter",
    roles: ["AWPer", "Rifler", "IGL", "Entry Fragger", "Lurker"],
    ranks: [
      "Silver",
      "Gold Nova",
      "Master Guardian",
      "Distinguished",
      "Legendary Eagle",
      "Supreme",
      "Global Elite",
    ],
  },
  "apex-legends": {
    name: "Apex Legends",
    category: "PC" as const,
    description: "Battle royale hero shooter",
    roles: ["Assault", "Recon", "Support", "Controller"],
    ranks: [
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Master",
      "Predator",
    ],
  },
  pubg: {
    name: "PUBG",
    category: "PC" as const,
    description: "Battle royale game",
    roles: ["IGL", "Fragger", "Support", "Sniper"],
    ranks: [
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Crown",
      "Ace",
      "Conqueror",
    ],
  },
  warcraft: {
    name: "Warcraft",
    category: "PC" as const,
    description: "Real-time strategy game",
    roles: ["Tank", "DPS", "Healer", "Support"],
    ranks: [
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Master",
      "Grandmaster",
    ],
  },
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
  standoff2: {
    name: "Standoff 2",
    category: "Mobile" as const,
    description: "Mobile first-person shooter",
    roles: ["AWPer", "Rifler", "IGL", "Entry Fragger"],
    ranks: [
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Legend",
      "Supreme",
      "Global Elite",
    ],
  },
  "pubg-mobile": {
    name: "PUBG Mobile",
    category: "Mobile" as const,
    description: "Mobile battle royale game",
    roles: ["IGL", "Fragger", "Support", "Sniper"],
    ranks: [
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Crown",
      "Ace",
      "Conqueror",
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
  const [loading, setLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [userClan, setUserClan] = useState<Clan | null>(null);
  const [invitingPlayer, setInvitingPlayer] = useState<string | null>(null);

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

  // Load user clan from API
  useEffect(() => {
    const fetchUserClan = async () => {
      if (user) {
        try {
          const response = await fetch(API_ENDPOINTS.CLANS.USER_CLAN, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setUserClan(data.clan || null);
          }
        } catch (error) {
          console.error("Error fetching user clan:", error);
        }
      } else {
        setUserClan(null);
      }
    };

    fetchUserClan();
  }, [user]);

  // Handle clan invitation
  const handleInviteToClan = async (player: Player) => {
    if (!userClan || !user) {
      alert("Та кланд орж байхгүй эсвэл нэвтрээгүй байна");
      return;
    }

    // Check if user is clan leader
    if (userClan.leader?._id !== user.id) {
      alert("Зөвхөн кланы дарга л тоглогч урих боломжтой");
      return;
    }

    // Check if player is already in the clan
    const isAlreadyInClan = userClan.members?.some(
      (member) => member.id === player.id
    );
    if (isAlreadyInClan) {
      alert("Энэ тоглогч аль хэдийн таны кланд байна");
      return;
    }

    try {
      setInvitingPlayer(player.id);
      const response = await fetch(API_ENDPOINTS.CLANS.INVITE(userClan._id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          playerId: player.id,
        }),
      });

      if (response.ok) {
        alert(`${player.name}-г таны кланд урилалав!`);
        // Refresh clan data
        const clanResponse = await fetch(API_ENDPOINTS.CLANS.USER_CLAN, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        });
        if (clanResponse.ok) {
          const data = await clanResponse.json();
          setUserClan(data.clan || null);
        }
      } else {
        const error = await response.json();
        alert(error.message || "Урилга илгээхэд алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error inviting player:", error);
      alert("Урилга илгээхэд алдаа гарлаа");
    } finally {
      setInvitingPlayer(null);
    }
  };

  // Check if user can invite players (is clan leader)
  const canInvitePlayers = userClan && user && userClan.leader?._id === user.id;

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

        // Filter players for this specific game
        const gamePlayers = allPlayers.filter(
          (player: Player) => player.game === game.name
        );

        setPlayers(gamePlayers);
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
  }, [game]);

  // Filter players
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

    // Filter by role
    if (selectedRole !== "Бүх Үүргүүд") {
      filtered = filtered.filter((player) => player.role === selectedRole);
    }

    // Filter by rank
    if (selectedRank !== "Бүх Ранкууд") {
      filtered = filtered.filter((player) => player.rank === selectedRank);
    }

    setFilteredPlayers(filtered);
  }, [players, searchTerm, selectedRole, selectedRank]);

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

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredPlayers.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                index={index}
                onOpenChat={handleOpenChat}
                canInviteToClan={!!canInvitePlayers}
                onInviteToClan={handleInviteToClan}
                invitingPlayer={invitingPlayer}
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
