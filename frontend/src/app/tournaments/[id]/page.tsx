"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useParams } from "next/navigation";
import {
  Calendar,
  Trophy,
  Users,
  MapPin,
  DollarSign,
  Star,
  Clock,
  Shield,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Tournament interface (same as in tournaments page)
interface Tournament {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  description: string;
  organizer: {
    id: string;
    name: string;
    logo: string;
    isVerified: boolean;
  };
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizePool: number;
  currency: string;
  tax: number;
  maxParticipants: number;
  currentParticipants: number;
  format: string;
  entryFee: number;
  location: string;
  status:
    | "upcoming"
    | "registration_open"
    | "registration_closed"
    | "ongoing"
    | "completed";
  requirements: string[];
  rules: string[];
  createdAt: string;
}

// Mock tournament data (same as in tournaments page)
const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Valorant Champions Cup 2024",
    game: "Valorant",
    gameIcon: "/games/valorant.png",
    description:
      "The ultimate Valorant championship featuring the best teams from around the world. Compete for glory and substantial prize money in this prestigious tournament.",
    organizer: {
      id: "org1",
      name: "Esports Mongolia",
      logo: "/default-avatar.png",
      isVerified: true,
    },
    startDate: "2024-02-15",
    endDate: "2024-02-18",
    registrationDeadline: "2024-02-10",
    prizePool: 50000,
    currency: "USD",
    tax: 10,
    maxParticipants: 64,
    currentParticipants: 32,
    format: "Single Elimination",
    entryFee: 100,
    location: "Online",
    status: "registration_open",
    requirements: [
      "Minimum rank: Immortal",
      "Team of 5 players",
      "18+ age requirement",
    ],
    rules: [
      "No cheating or exploits",
      "Professional conduct required",
      "All matches streamed",
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "CS2 Winter Championship",
    game: "Counter-Strike 2",
    gameIcon: "/games/cs2.png",
    description:
      "Experience the thrill of Counter-Strike 2 in this winter championship. Professional teams battle it out for the crown.",
    organizer: {
      id: "org2",
      name: "Gaming Arena MN",
      logo: "/default-avatar.png",
      isVerified: true,
    },
    startDate: "2024-02-20",
    endDate: "2024-02-25",
    registrationDeadline: "2024-02-15",
    prizePool: 75000,
    currency: "USD",
    tax: 15,
    maxParticipants: 32,
    currentParticipants: 28,
    format: "Double Elimination",
    entryFee: 150,
    location: "Ulaanbaatar Gaming Center",
    status: "registration_open",
    requirements: [
      "Global Elite rank or higher",
      "Team of 5 players",
      "Valid passport",
    ],
    rules: [
      "FACEIT Anti-Cheat required",
      "English communication only",
      "No map vetoes",
    ],
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "PUBG Mobile National Cup",
    game: "PUBG Mobile",
    gameIcon: "/games/pubg-mobile.png",
    description:
      "Mobile gaming at its finest. Join the biggest PUBG Mobile tournament in Mongolia.",
    organizer: {
      id: "org3",
      name: "Mobile Esports Union",
      logo: "/default-avatar.png",
      isVerified: false,
    },
    startDate: "2024-03-01",
    endDate: "2024-03-03",
    registrationDeadline: "2024-02-25",
    prizePool: 25000,
    currency: "USD",
    tax: 8,
    maxParticipants: 100,
    currentParticipants: 45,
    format: "Round Robin + Playoffs",
    entryFee: 50,
    location: "Online",
    status: "upcoming",
    requirements: [
      "Crown tier or above",
      "Squad of 4 players",
      "Mongolian residency",
    ],
    rules: [
      "No emulators allowed",
      "Stock game settings",
      "Fair play monitoring",
    ],
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    name: "Dota 2 Spring Festival",
    game: "Dota 2",
    gameIcon: "/games/dota2.png",
    description:
      "Celebrate spring with the most competitive Dota 2 tournament of the season.",
    organizer: {
      id: "org4",
      name: "Pro Gaming League",
      logo: "/default-avatar.png",
      isVerified: true,
    },
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    registrationDeadline: "2024-03-10",
    prizePool: 100000,
    currency: "USD",
    tax: 20,
    maxParticipants: 16,
    currentParticipants: 8,
    format: "Swiss System + Single Elimination",
    entryFee: 200,
    location: "Central Sports Palace, Ulaanbaatar",
    status: "upcoming",
    requirements: [
      "Divine rank minimum",
      "Team of 5 players",
      "Professional gaming experience",
    ],
    rules: ["Captain's Mode only", "Tournament realm", "Live audience"],
    createdAt: "2024-01-20",
  },
];

export default function TournamentDetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundTournament = mockTournaments.find((t) => t.id === params.id);
      setTournament(foundTournament || null);
      setIsLoading(false);
    };

    if (params.id) {
      fetchTournament();
    }
  }, [params.id]);

  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "registration_open":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "registration_closed":
        return "bg-yellow-500";
      case "ongoing":
        return "bg-purple-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "registration_open":
        return "Бүртгэл нээлттэй";
      case "upcoming":
        return "Удахгүй";
      case "registration_closed":
        return "Бүртгэл хаагдсан";
      case "ongoing":
        return "Явагдаж байна";
      case "completed":
        return "Дууссан";
      default:
        return status;
    }
  };

  const formatPrizePool = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateNetPrizePool = (prizePool: number, tax: number) => {
    return prizePool * (1 - tax / 100);
  };

  const canRegister = (status: Tournament["status"], deadline: string) => {
    return status === "registration_open" && new Date(deadline) > new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Тэмцээн олдсонгүй
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Таны хайсан тэмцээн байхгүй эсвэл устгагдсан байна.
          </p>
          <Link href="/tournaments">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300"
            >
              Тэмцээнүүдэд буцах
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/tournaments"
            className="flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Тэмцээнүүдэд буцах</span>
          </Link>
        </motion.div>

        {/* Tournament Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8"
        >
          {/* Hero Section */}
          <div className="relative h-64 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute top-6 left-6 flex items-center space-x-3">
              <div className="w-12 h-12 relative">
                <Image
                  src={tournament.gameIcon}
                  alt={tournament.game}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <span className="text-white text-lg font-semibold">
                  {tournament.game}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(
                      tournament.status
                    )}`}
                  >
                    {getStatusText(tournament.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">
                {tournament.name}
              </h1>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src={tournament.organizer.logo}
                    alt={tournament.organizer.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-medium">
                    {tournament.organizer.name}
                  </span>
                  {tournament.organizer.isVerified && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPrizePool(tournament.prizePool, tournament.currency)}
                </div>
                <div className="text-sm text-gray-500">Нийт шагнал</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Цэвэр:{" "}
                  {formatPrizePool(
                    calculateNetPrizePool(tournament.prizePool, tournament.tax),
                    tournament.currency
                  )}
                </div>
              </div>

              <div className="text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tournament.currentParticipants}/{tournament.maxParticipants}
                </div>
                <div className="text-sm text-gray-500">Оролцогчид</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (tournament.currentParticipants /
                          tournament.maxParticipants) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tournament.entryFee} {tournament.currency}
                </div>
                <div className="text-sm text-gray-500">Бүртгэлийн төлбөр</div>
                <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Татвар: {tournament.tax}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tournament Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Тэмцээний тухай
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {tournament.description}
              </p>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Шаардлага
              </h2>
              <ul className="space-y-2">
                {tournament.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 dark:bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {requirement}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Дүрэм журам
              </h2>
              <ul className="space-y-2">
                {tournament.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 dark:bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tournament Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Тэмцээний мэдээлэл
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Эхлэх огноо</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(tournament.startDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Дуусах огноо</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(tournament.endDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">
                      Бүртгэлийн хугацаа
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(tournament.registrationDeadline)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Байршил</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {tournament.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Формат</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {tournament.format}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Registration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Бүртгэл
              </h3>

              {canRegister(
                tournament.status,
                tournament.registrationDeadline
              ) ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 mb-4"
                >
                  Тэмцээнд бүртгүүлэх
                </motion.button>
              ) : (
                <div className="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 py-3 px-4 rounded-lg font-medium text-center mb-4">
                  Бүртгэл хаагдсан
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between mb-2">
                  <span>Бүртгэлийн төлбөр:</span>
                  <span className="font-medium">
                    {tournament.entryFee} {tournament.currency}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Татвар:</span>
                  <span className="font-medium">{tournament.tax}%</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span>Нийт төлбөр:</span>
                  <span className="font-medium">
                    {Math.round(
                      tournament.entryFee * (1 + tournament.tax / 100)
                    )}{" "}
                    {tournament.currency}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Зохион байгуулагч
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 relative">
                  <Image
                    src={tournament.organizer.logo}
                    alt={tournament.organizer.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tournament.organizer.name}
                    </span>
                    {tournament.organizer.isVerified && (
                      <Star className="w-4 h-4 text-blue-500 fill-current" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tournament.organizer.isVerified
                      ? "Баталгаажсан"
                      : "Баталгаажаагүй"}
                  </div>
                </div>
              </div>
              <Link href={`/organizations/${tournament.organizer.id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border border-purple-500 dark:border-green-500 text-purple-600 dark:text-green-400 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Профайл үзэх</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
