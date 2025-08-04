"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gamepad2,
  Shield,
  Sword,
  Zap,
  Monitor,
  Smartphone,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Twitch,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import ChatModal from "../../components/ChatModal";
import { useAuth } from "../../contexts/AuthContext";

interface Player {
  id: string;
  name: string;
  avatar: string;
  category: "PC" | "Mobile";
  game: string;
  role: string;
  inGameName: string;
  rank: string;
  experience: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
    website?: string;
  };
  highlightVideo?: string;
  isLookingForTeam: boolean;
}

// Mock data for player details
const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Баттулга",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    category: "PC",
    game: "Dota 2",
    role: "Carry",
    inGameName: "BatTulga_Carry",
    rank: "Divine",
    experience: "5+ жил",
    bio: "Мэргэжлийн carry тоглогч, өрсөлдөөнт баг хайж байна. Dota 2-т 5+ жил туршлагатай, Divine rank-тай. Хүчтэй farming болон team fight-д сайн. Хамтран ажиллах чадвартай, багийн стратегийг ойлгож, дагаж ажилладаг.",
    socialLinks: {
      twitter: "https://twitter.com/battulga_carry",
      instagram: "https://instagram.com/battulga_gaming",
      twitch: "https://twitch.tv/battulga_carry",
      discord: "BatTulga#1234",
    },
    highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isLookingForTeam: true,
  },
  {
    id: "2",
    name: "Төмөөлэн",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    category: "PC",
    game: "CS2",
    role: "AWPer",
    inGameName: "Tumee_AWP",
    rank: "Global Elite",
    experience: "3+ жил",
    bio: "Сайн game sense-тэй чадвартай AWPer. CS2-т 3+ жил туршлагатай, Global Elite rank-тай. Хүчтэй aim болон positioning-тэй. Team communication-д сайн, IGL-тэй сайн ажилладаг.",
    socialLinks: {
      youtube: "https://youtube.com/@tumee_awp",
      twitch: "https://twitch.tv/tumee_awp",
      discord: "TumeeAWP#5678",
    },
    isLookingForTeam: true,
  },
  {
    id: "3",
    name: "Ананд",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    category: "PC",
    game: "Valorant",
    role: "Duelist",
    inGameName: "Anand_Entry",
    rank: "Immortal",
    experience: "4+ жил",
    bio: "Хүчтэй roaming боломжтой агрессив entry fragger. Valorant-т 4+ жил туршлагатай, Immortal rank-тай. Хүчтэй aim болон game sense-тэй. Entry fragging-д сайн, team coordination-д сайн.",
    socialLinks: {
      twitter: "https://twitter.com/anand_entry",
      instagram: "https://instagram.com/anand_gaming",
      discord: "AnandEntry#9012",
    },
    isLookingForTeam: false,
  },
  {
    id: "4",
    name: "Болд",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    category: "PC",
    game: "Apex Legends",
    role: "Assault",
    inGameName: "Bold_Assault",
    rank: "Diamond",
    experience: "2+ жил",
    bio: "Сайн aim болон game sense-тэй assault legend. Apex Legends-т 2+ жил туршлагатай, Diamond rank-тай. Хүчтэй movement болон positioning-тэй. Team play-д сайн, communication-д сайн.",
    socialLinks: {
      youtube: "https://youtube.com/@bold_assault",
      twitch: "https://twitch.tv/bold_assault",
      discord: "BoldAssault#3456",
    },
    isLookingForTeam: true,
  },
  {
    id: "5",
    name: "Сарнай",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    category: "PC",
    game: "Dota 2",
    role: "Support",
    inGameName: "Sarnai_Support",
    rank: "Ancient",
    experience: "6+ жил",
    bio: "Хүчтэй map awareness-тэй туршлагатай support тоглогч. Dota 2-т 6+ жил туршлагатай, Ancient rank-тай. Warding, stacking, pulling-д сайн. Team coordination-д сайн, carry-г сайн support хийдэг.",
    socialLinks: {
      instagram: "https://instagram.com/sarnai_support",
      discord: "SarnaiSupport#7890",
    },
    isLookingForTeam: true,
  },
  {
    id: "6",
    name: "Мөнх",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    category: "PC",
    game: "CS2",
    role: "IGL",
    inGameName: "Munkh_IGL",
    rank: "Legendary Eagle",
    experience: "7+ жил",
    bio: "Сайн удирдлагын ур чадвартай стратеги IGL. CS2-т 7+ жил туршлагатай, Legendary Eagle rank-тай. Strategy making, team leading-д сайн. Communication-д сайн, team motivation-д сайн.",
    socialLinks: {
      twitter: "https://twitter.com/munkh_igl",
      youtube: "https://youtube.com/@munkh_igl",
      discord: "MunkhIGL#1234",
    },
    isLookingForTeam: false,
  },
  {
    id: "7",
    name: "Энхжаргал",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    category: "Mobile",
    game: "Mobile Legends",
    role: "Mage",
    inGameName: "Enkhjargal_Mage",
    rank: "Mythic",
    experience: "3+ жил",
    bio: "Хүчтэй burst damage-тэй mage тоглогч. Mobile Legends-т 3+ жил туршлагатай, Mythic rank-тай. Burst damage, crowd control-д сайн. Team fight-д сайн, positioning-д сайн.",
    socialLinks: {
      instagram: "https://instagram.com/enkhjargal_mage",
      youtube: "https://youtube.com/@enkhjargal_mage",
      discord: "EnkhjargalMage#5678",
    },
    isLookingForTeam: true,
  },
  {
    id: "8",
    name: "Батбаяр",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    category: "Mobile",
    game: "Standoff 2",
    role: "AWPer",
    inGameName: "Batbayar_AWP",
    rank: "Legend",
    experience: "2+ жил",
    bio: "Сайн aim-тэй mobile AWPer. Standoff 2-т 2+ жил туршлагатай, Legend rank-тай. Хүчтэй aim болон reaction time-тэй. Mobile gaming-д сайн, team coordination-д сайн.",
    socialLinks: {
      youtube: "https://youtube.com/@batbayar_awp",
      discord: "BatbayarAWP#9012",
    },
    isLookingForTeam: true,
  },
  {
    id: "9",
    name: "Ганбаатар",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    category: "Mobile",
    game: "PUBG Mobile",
    role: "IGL",
    inGameName: "Ganbaatar_IGL",
    rank: "Conqueror",
    experience: "4+ жил",
    bio: "Сайн удирдлагын ур чадвартай mobile IGL. PUBG Mobile-т 4+ жил туршлагатай, Conqueror rank-тай. Strategy making, team leading-д сайн. Mobile gaming-д сайн, communication-д сайн.",
    socialLinks: {
      twitter: "https://twitter.com/ganbaatar_igl",
      instagram: "https://instagram.com/ganbaatar_gaming",
      youtube: "https://youtube.com/@ganbaatar_igl",
      discord: "GanbaatarIGL#3456",
    },
    isLookingForTeam: false,
  },
];

export default function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundPlayer = mockPlayers.find((p) => p.id === id);
        setPlayer(foundPlayer || null);
      } catch (error) {
        console.error("Failed to fetch player:", error);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Carry":
      case "Duelist":
      case "Assault":
      case "Fighter":
        return <Sword className="w-6 h-6" />;
      case "Support":
      case "Hard Support":
      case "Sentinel":
        return <Shield className="w-6 h-6" />;
      case "Mid":
      case "Mage":
      case "Initiator":
        return <Zap className="w-6 h-6" />;
      default:
        return <Gamepad2 className="w-6 h-6" />;
    }
  };

  const getCategoryIcon = (category: "PC" | "Mobile") => {
    return category === "PC" ? (
      <Monitor className="w-6 h-6" />
    ) : (
      <Smartphone className="w-6 h-6" />
    );
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "twitch":
        return <Twitch className="w-5 h-5" />;
      case "discord":
        return <MessageCircle className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
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
                Loading player details...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Player not found
              </h1>
              <Link
                href="/players"
                className="inline-flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Players</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/players"
              className="inline-flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Players</span>
            </Link>
          </motion.div>

          {/* Player Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Player Image */}
              <div className="relative">
                <Image
                  src={player.avatar}
                  alt={player.name}
                  width={200}
                  height={200}
                  className="rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                />
              </div>

              {/* Player Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {player.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(player.category)}
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {player.category}
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {player.game}
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(player.role)}
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {player.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      In-Game Name
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {player.inGameName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Rank
                    </h3>
                    <p className="text-lg font-semibold text-purple-600 dark:text-green-400">
                      {player.rank}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Experience
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {player.experience}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {player.isLookingForTeam && (
                    <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      Баг Хайж Байна
                    </div>
                  )}

                  {user && user.id !== player.id && (
                    <motion.button
                      onClick={() => setIsChatOpen(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 dark:bg-green-600 text-white rounded-full hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Chat</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Bio
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {player.bio}
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Social Links
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(player.socialLinks).map(([platform, link]) => (
                <motion.a
                  key={platform}
                  href={
                    platform === "discord"
                      ? `https://discord.com/users/${link}`
                      : link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-green-400 transition-colors duration-200">
                    {getSocialIcon(platform)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {platform}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Highlight Video Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Highlight Video
            </h2>

            {player.highlightVideo ? (
              <div className="space-y-4">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                      player.highlightVideo
                    )}`}
                    title={`${player.name} Highlight Video`}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    YouTube Highlight Video
                  </p>
                  <a
                    href={player.highlightVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:underline"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Watch on YouTube</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Highlight Video
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This player hasn't uploaded a highlight video yet.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    To add a highlight video, players can:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Upload their best gameplay moments to YouTube</li>
                    <li>• Share the YouTube video URL in their profile</li>
                    <li>• Showcase their skills and achievements</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Chat Modal */}
      {player && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          playerId={player.id}
          playerName={player.name}
          playerAvatar={player.avatar}
        />
      )}
    </div>
  );
}
