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
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import ChatModal from "../../components/ChatModal";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

interface Player {
  id: string;
  name: string;
  realName?: string;
  avatar?: string;
  avatarPublicId?: string;
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
  achievements?: string[];
  preferredRoles?: string[];
  availability?: {
    weekdays: boolean;
    weekends: boolean;
    timezone: string;
    preferredHours: string;
  };
  languages?: string[];
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
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [playerTeam, setPlayerTeam] = useState<{
    tag: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    console.log("🔍 PlayerDetailPage: useEffect triggered with id:", id);

    // Fetch player from API
    const fetchPlayer = async () => {
      try {
        setLoading(true);

        // Use the specific player endpoint
        const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.GET(id));

        if (response.ok) {
          const data = await response.json();
          console.log("🔍 Player data received:", data);

          if (data.profile) {
            setPlayer(data.profile);
          } else {
            console.error("🔍 No profile data in response");
            setPlayer(null);
          }
        } else if (response.status === 404) {
          console.log("🔍 Player not found");
          setPlayer(null);
        } else {
          console.error("🔍 Failed to fetch player, status:", response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error("🔍 Error response:", errorData);
          throw new Error("Failed to fetch player");
        }
      } catch (error) {
        console.error("Failed to fetch player:", error);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  // Load user team and check player's team status
  useEffect(() => {
    const loadTeamData = () => {
      // Load current user's team
      const savedTeam = localStorage.getItem("userTeam");
      if (savedTeam) {
        try {
          const team = JSON.parse(savedTeam);
          setUserTeam(team);
        } catch (error) {
          console.error("Error parsing saved team:", error);
          setUserTeam(null);
        }
      } else {
        setUserTeam(null);
      }

      // Check if current player is in any team
      if (player) {
        // In a real app, this would be fetched from API
        // For now, check localStorage for teams
        const allTeams = [];
        const userTeamData = localStorage.getItem("userTeam");
        if (userTeamData) {
          allTeams.push(JSON.parse(userTeamData));
        }

        // Find team that contains this player
        let foundTeam = null;
        for (const team of allTeams) {
          const member = team.members.find(
            (m: TeamMember) => m.id === player.id && m.status === "accepted"
          );
          if (member) {
            foundTeam = { tag: team.tag, name: team.name };
            break;
          }
        }
        setPlayerTeam(foundTeam);
      }
    };

    loadTeamData();

    // Listen for team updates
    const handleTeamUpdate = () => {
      loadTeamData();
    };

    window.addEventListener("teamUpdated", handleTeamUpdate);
    window.addEventListener("storage", handleTeamUpdate);

    return () => {
      window.removeEventListener("teamUpdated", handleTeamUpdate);
      window.removeEventListener("storage", handleTeamUpdate);
    };
  }, [player]);

  // Handle team invitation
  const handleInviteToTeam = () => {
    if (!userTeam || !user || !player) {
      alert("Та багт орж байхгүй эсвэл нэвтрээгүй байна");
      return;
    }

    // Check if user is team owner
    if (userTeam.createdBy !== user.id) {
      alert("Зөвхөн багийн дарга л тоглогч урих боломжтой");
      return;
    }

    // Check if player is already in the team
    const isAlreadyInTeam = userTeam.members.some(
      (member) => member.id === player.id
    );
    if (isAlreadyInTeam) {
      alert("Энэ тоглогч аль хэдийн таны багт байна");
      return;
    }

    // Check if player is in another team (accepted status)
    if (playerTeam) {
      alert("Энэ тоглогч өөр багт орсон байна");
      return;
    }

    // Add player to team with pending status
    const newMember: TeamMember = {
      id: player.id,
      name: player.name,
      avatar: player.avatar || "/default-avatar.png",
      status: "pending",
      invitedAt: new Date().toISOString(),
    };

    const updatedTeam = {
      ...userTeam,
      members: [...userTeam.members, newMember],
    };

    // Update localStorage and state
    localStorage.setItem("userTeam", JSON.stringify(updatedTeam));
    setUserTeam(updatedTeam);

    // Trigger update event
    window.dispatchEvent(new Event("teamUpdated"));

    alert(`${player.name}-г таны багт урилалав!`);
  };

  // Check invitation status
  const getInvitationStatus = () => {
    if (!userTeam || !player) return null;

    const member = userTeam.members.find((m) => m.id === player.id);
    return member ? member.status : null;
  };

  // Get button state
  const getInviteButtonState = () => {
    if (!userTeam || !user) return null;

    if (userTeam.createdBy !== user.id) return null; // Not team owner

    const invitationStatus = getInvitationStatus();

    if (playerTeam) {
      return {
        disabled: true,
        text: "Багт орсон",
        reason: "Player is in a team",
      };
    }

    if (invitationStatus === "pending") {
      return {
        disabled: false,
        text: "Дахин урих",
        reason: "Invitation pending",
      };
    }

    if (invitationStatus === "accepted") {
      return {
        disabled: true,
        text: "Багт орсон",
        reason: "Player accepted invitation",
      };
    }

    return { disabled: false, text: "Багт урих", reason: "Can invite" };
  };

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Player Image */}
              <div className="relative flex-shrink-0">
                <Image
                  src={player.avatar || "/default-avatar.png"}
                  alt={player.name}
                  width={200}
                  height={200}
                  className="rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-lg w-32 h-32 sm:w-48 sm:h-48 lg:w-52 lg:h-52"
                />
              </div>

              {/* Player Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3">
                  {playerTeam && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-2 sm:px-3 py-1 rounded-lg text-sm sm:text-base lg:text-lg font-bold shadow-lg">
                      [{playerTeam.tag}]
                    </span>
                  )}
                  <span className="text-center lg:text-left">
                    {player.realName || player.name}
                  </span>
                </h1>

                {player.realName &&
                  player.inGameName &&
                  player.realName !== player.inGameName && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                        Тоглоомын нэр: {player.inGameName}
                      </span>
                    </div>
                  )}

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
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

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  {player.isLookingForTeam && (
                    <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      Баг Хайж Байна
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {/* Team Invite Button - Only show for team owners */}
                    {getInviteButtonState() && (
                      <motion.button
                        onClick={handleInviteToTeam}
                        disabled={getInviteButtonState()?.disabled}
                        className={`inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base ${
                          getInviteButtonState()?.disabled
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                        }`}
                        whileHover={
                          !getInviteButtonState()?.disabled
                            ? { scale: 1.05 }
                            : {}
                        }
                        whileTap={
                          !getInviteButtonState()?.disabled
                            ? { scale: 0.95 }
                            : {}
                        }
                        title={getInviteButtonState()?.reason}
                      >
                        <UserPlus className="w-5 h-5" />
                        <span>{getInviteButtonState()?.text}</span>
                      </motion.button>
                    )}

                    {user && user.id !== player.id && (
                      <motion.button
                        onClick={() => setIsChatOpen(true)}
                        className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 dark:bg-green-600 text-white rounded-full hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
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
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8"
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
              {player.socialLinks &&
                Object.entries(player.socialLinks)
                  .filter(([, link]) => link)
                  .map(([platform, link]) => (
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
              {(!player.socialLinks ||
                Object.keys(player.socialLinks || {}).length === 0 ||
                Object.values(player.socialLinks || {}).every(
                  (link) => !link
                )) && (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Social Links
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    This player hasn&apos;t added any social media links yet.
                  </p>
                </div>
              )}
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
                    src={`https://www.youtube.com/embed/${
                      getYouTubeVideoId(player.highlightVideo) || ""
                    }`}
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
                  This player hasn&apos;t uploaded a highlight video yet.
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
