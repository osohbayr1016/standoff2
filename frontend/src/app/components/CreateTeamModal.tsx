"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  X,
  Upload,
  Users,
  Search,
  UserPlus,
  Check,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
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

interface Player {
  id: string;
  name: string;
  avatar: string;
  game: string;
  rank: string;
}

// Mock player data for invitations
const mockPlayers: Player[] = [
  {
    id: "player1",
    name: "Болдбаатар",
    avatar: "/default-avatar.png",
    game: "Valorant",
    rank: "Immortal",
  },
  {
    id: "player2",
    name: "Мөнхбаяр",
    avatar: "/default-avatar.png",
    game: "Valorant",
    rank: "Diamond",
  },
  {
    id: "player3",
    name: "Энхбаяр",
    avatar: "/default-avatar.png",
    game: "CS2",
    rank: "Global Elite",
  },
  {
    id: "player4",
    name: "Батбаяр",
    avatar: "/default-avatar.png",
    game: "PUBG",
    rank: "Crown",
  },
];

const games = [
  {
    name: "Valorant",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg",
    category: "PC",
  },
  {
    name: "Counter-Strike 2",
    icon: "https://images.seeklogo.com/logo-png/47/2/counter-strike-2-logo-png_seeklogo-477404.png",
    category: "PC",
  },
  {
    name: "PUBG",
    icon: "https://images.seeklogo.com/logo-png/39/2/pubg-mobile-logo-png_seeklogo-399111.png",
    category: "PC",
  },
  {
    name: "PUBG Mobile",
    icon: "https://play-lh.googleusercontent.com/JRd05pyBH41qjgsJuWduRJpDeZG0Hnb0yjf2nWqO7VaGKL10-G5UIygxED-WNOc3pg",
    category: "Mobile",
  },
  {
    name: "Dota 2",
    icon: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png",
    category: "PC",
  },
  {
    name: "Mobile Legends",
    icon: "https://i.redd.it/op52fca67y9c1.jpeg",
    category: "Mobile",
  },
  {
    name: "Apex Legends",
    icon: "https://cdn.akamai.steamstatic.com/steam/apps/1172470/logo.png",
    category: "PC",
  },
  {
    name: "Standoff 2",
    icon: "https://i.pinimg.com/originals/42/cb/81/42cb812f44c77d4c0cf40774df855ae6.png",
    category: "Mobile",
  },
];

export default function CreateTeamModal({
  isOpen,
  onClose,
  onTeamCreated,
}: CreateTeamModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Game selection, 2: Team details, 3: Invite players
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(
    null
  );
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [useGameLogo, setUseGameLogo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [invitedPlayers, setInvitedPlayers] = useState<Player[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep(1);
    setSelectedGame(null);
    setTeamName("");
    setTeamTag("");
    setTeamLogo("");
    setUseGameLogo(true);
    setSearchTerm("");
    setInvitedPlayers([]);
    setIsCreating(false);
    onClose();
  };

  const handleGameSelect = (game: (typeof games)[0]) => {
    setSelectedGame(game);
    setStep(2);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTeamLogo(e.target?.result as string);
        setUseGameLogo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseGameLogo = () => {
    setUseGameLogo(true);
    setTeamLogo("");
  };

  const getEffectiveTeamLogo = () => {
    if (useGameLogo && selectedGame) {
      return selectedGame.icon;
    }
    return teamLogo || "/default-avatar.png";
  };

  const validateTeamDetails = () => {
    return teamName.length >= 3 && teamTag.length >= 2 && teamTag.length <= 4;
  };

  const handleNextToInvite = () => {
    if (validateTeamDetails()) {
      setStep(3);
    }
  };

  const filteredPlayers = mockPlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !invitedPlayers.some((invited) => invited.id === player.id)
  );

  const handleInvitePlayer = (player: Player) => {
    setInvitedPlayers([...invitedPlayers, player]);
  };

  const handleRemoveInvite = (playerId: string) => {
    setInvitedPlayers(invitedPlayers.filter((p) => p.id !== playerId));
  };

  const handleCreateTeam = async () => {
    if (!selectedGame || !user) return;

    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: teamName,
      tag: teamTag,
      logo: getEffectiveTeamLogo(),
      game: selectedGame.name,
      gameIcon: selectedGame.icon,
      createdBy: user.id || "current_user",
      members: invitedPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        status: "pending" as const,
        invitedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    };

    // Add creator as first member with accepted status
    newTeam.members.unshift({
      id: user.id || "current_user",
      name: user.name || "You",
      avatar: user.avatar || "/default-avatar.png",
      status: "accepted",
      invitedAt: new Date().toISOString(),
    });

    onTeamCreated(newTeam);
    setIsCreating(false);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ minHeight: "100vh", minWidth: "100vw" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative border border-gray-200 dark:border-gray-700 m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === 1 && "Тоглоом сонгох"}
                {step === 2 && "Багийн мэдээлэл"}
                {step === 3 && "Тоглогчдоо урих"}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content Container */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Step 1: Game Selection */}
              {step === 1 && (
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Багаа үүсгэхийн тулд эхлээд тоглоомоо сонгоно уу:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {games.map((game) => (
                      <motion.button
                        key={game.name}
                        onClick={() => handleGameSelect(game)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-green-500 transition-colors"
                      >
                        <div className="w-16 h-16 relative mb-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                          <Image
                            src={game.icon}
                            alt={game.name}
                            width={56}
                            height={56}
                            className="rounded-lg object-contain drop-shadow-lg"
                            unoptimized={true}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-center">
                                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                    </svg>
                                    <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">${game.name}</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                          {game.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Team Details */}
              {step === 2 && selectedGame && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded flex items-center justify-center overflow-hidden">
                      <Image
                        src={selectedGame.icon}
                        alt={selectedGame.name}
                        width={28}
                        height={28}
                        className="rounded object-contain"
                        unoptimized={true}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedGame.name}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Team Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Багийн лого
                      </label>

                      {/* Logo options */}
                      <div className="flex items-center space-x-4 mb-4">
                        <button
                          type="button"
                          onClick={handleUseGameLogo}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                            useGameLogo
                              ? "border-purple-500 dark:border-green-500 bg-purple-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="w-8 h-8 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded flex items-center justify-center overflow-hidden">
                            {selectedGame && (
                              <Image
                                src={selectedGame.icon}
                                alt={selectedGame.name}
                                width={28}
                                height={28}
                                className="rounded object-contain"
                                unoptimized={true}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Тоглоомын лого
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                            !useGameLogo && teamLogo
                              ? "border-purple-500 dark:border-green-500 bg-purple-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Хувийн лого
                          </span>
                        </button>
                      </div>

                      {/* Logo preview */}
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                          <Image
                            src={getEffectiveTeamLogo()}
                            alt="Team logo"
                            width={64}
                            height={64}
                            className="rounded-lg object-contain"
                            unoptimized={true}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-center">
                                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                    </svg>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">Logo</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {useGameLogo ? (
                            <p>
                              <span className="font-medium">
                                Тоглоомын лого:
                              </span>
                              <br />
                              {selectedGame?.name} логог ашиглаж байна
                            </p>
                          ) : teamLogo ? (
                            <p>
                              <span className="font-medium">Хувийн лого:</span>
                              <br />
                              Таны оруулсан зураг
                            </p>
                          ) : (
                            <p>
                              <span className="font-medium">Анхдагч лого:</span>
                              <br />
                              Багийн стандарт лого
                            </p>
                          )}
                        </div>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Team Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Багийн нэр
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Багийн нэрээ оруулна уу"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400 focus:border-transparent"
                      />
                      {teamName.length > 0 && teamName.length < 3 && (
                        <p className="text-red-500 text-xs mt-1">
                          Багийн нэр дор хаяж 3 тэмдэгт байх ёстой
                        </p>
                      )}
                    </div>

                    {/* Team Tag */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Багийн TAG (2-4 үсэг)
                      </label>
                      <input
                        type="text"
                        value={teamTag}
                        onChange={(e) =>
                          setTeamTag(e.target.value.toUpperCase().slice(0, 4))
                        }
                        placeholder="TEAM"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        TAG нь тоглогчдын нэрний өмнө харагдана. Жишээ: [TEAM]
                        Болдбаатар
                      </p>
                      {teamTag.length > 0 &&
                        (teamTag.length < 2 || teamTag.length > 4) && (
                          <p className="text-red-500 text-xs mt-1">
                            TAG нь 2-4 үсэг байх ёстой
                          </p>
                        )}
                    </div>

                    {/* Preview */}
                    {teamName && teamTag && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Үзэх:
                        </p>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded flex items-center justify-center overflow-hidden">
                            <Image
                              src={getEffectiveTeamLogo()}
                              alt="Team logo"
                              width={28}
                              height={28}
                              className="rounded object-contain"
                              unoptimized={true}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            [{teamTag}] {teamName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between mt-6">
                    <motion.button
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      Буцах
                    </motion.button>
                    <motion.button
                      onClick={handleNextToInvite}
                      disabled={!validateTeamDetails()}
                      whileHover={{ scale: validateTeamDetails() ? 1.05 : 1 }}
                      whileTap={{ scale: validateTeamDetails() ? 0.95 : 1 }}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        validateTeamDetails()
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Цаашаа
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 3: Invite Players */}
              {step === 3 && (
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Багтаа тоглогчдоо урина уу (бас дараа уригж болно):
                  </p>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Тоглогч хайх..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400 focus:border-transparent"
                    />
                  </div>

                  {/* Invited Players */}
                  {invitedPlayers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Уригдсан тоглогчид:
                      </h4>
                      <div className="space-y-2">
                        {invitedPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 bg-purple-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <Image
                                src={player.avatar}
                                alt={player.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {player.name}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {player.rank}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-gray-500">
                                Хүлээгдэж байна
                              </span>
                              <button
                                onClick={() => handleRemoveInvite(player.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Players */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Image
                            src={player.avatar}
                            alt={player.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {player.name}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {player.game} • {player.rank}
                            </div>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => handleInvitePlayer(player)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-purple-500 dark:bg-green-500 text-white rounded-lg hover:bg-purple-600 dark:hover:bg-green-600 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm">Урих</span>
                        </motion.button>
                      </div>
                    ))}
                  </div>

                  {filteredPlayers.length === 0 && searchTerm && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Тоглогч олдсонгүй
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between mt-6">
                    <motion.button
                      onClick={() => setStep(2)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      Буцах
                    </motion.button>
                    <motion.button
                      onClick={handleCreateTeam}
                      disabled={isCreating}
                      whileHover={{ scale: isCreating ? 1 : 1.05 }}
                      whileTap={{ scale: isCreating ? 1 : 0.95 }}
                      className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                        isCreating
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600"
                      }`}
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Үүсгэж байна...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Баг үүсгэх</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
