"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
  Calendar,
  Trophy,
  Users,
  MapPin,
  DollarSign,
  Star,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Tournament interface based on the requirements
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
  tax: number; // percentage
  maxParticipants: number;
  currentParticipants: number;
  format: string; // "Single Elimination", "Double Elimination", "Round Robin", etc.
  entryFee: number;
  location: string; // "Online" or physical location
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

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
    []
  );
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tournaments from API
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from API
        const response = await fetch("/api/tournaments");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tournaments) {
            setTournaments(data.tournaments);
            setFilteredTournaments(data.tournaments);
          } else {
            // No tournaments available
            setTournaments([]);
            setFilteredTournaments([]);
          }
        } else {
          // API not available, show empty state
          setTournaments([]);
          setFilteredTournaments([]);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setError("Failed to load tournaments. Please try again later.");
        setTournaments([]);
        setFilteredTournaments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    let filtered = tournaments;

    if (selectedGame !== "all") {
      filtered = filtered.filter(
        (tournament) => tournament.game === selectedGame
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (tournament) => tournament.status === selectedStatus
      );
    }

    setFilteredTournaments(filtered);
  }, [tournaments, selectedGame, selectedStatus]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-300 dark:bg-gray-600 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Удахгүй болох тэмцээнүүд
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Хамгийн том e-sports тэмцээнүүдэд оролцож, өөрийн чадварыг
            харуулаарай
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Empty State - No tournaments available */}
        {tournaments.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Trophy className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Тэмцээн байхгүй байна
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Одоогоор идэвхтэй тэмцээн байхгүй байна. Шинэ тэмцээнүүд
              нэмэгдэхэд энд харагдана.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Тэмцээн зохион байгуулах хүсэлтэй бол бидэнтэй холбогдоно уу.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300"
              >
                Холбогдох
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tournaments Grid - Only show if tournaments exist */}
        {tournaments.length > 0 && (
          <>
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-4 mb-8 justify-center"
            >
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400"
              >
                <option value="all">Бүх тоглоом</option>
                {Array.from(new Set(tournaments.map((t) => t.game))).map(
                  (game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  )
                )}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400"
              >
                <option value="all">Бүх төлөв</option>
                <option value="registration_open">Бүртгэл нээлттэй</option>
                <option value="upcoming">Удахгүй</option>
                <option value="registration_closed">Бүртгэл хаагдсан</option>
                <option value="ongoing">Явагдаж байна</option>
                <option value="completed">Дууссан</option>
              </select>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Tournament Header */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className="w-8 h-8 relative">
                        <Image
                          src={tournament.gameIcon}
                          alt={tournament.game}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <span className="text-white font-semibold">
                        {tournament.game}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                          tournament.status
                        )}`}
                      >
                        {getStatusText(tournament.status)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">
                        {tournament.name}
                      </h3>
                    </div>
                  </div>

                  {/* Tournament Content */}
                  <div className="p-6">
                    {/* Organizer */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 relative">
                        <Image
                          src={tournament.organizer.logo}
                          alt={tournament.organizer.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {tournament.organizer.name}
                        </span>
                        {tournament.organizer.isVerified && (
                          <Star className="w-4 h-4 text-blue-500 fill-current" />
                        )}
                      </div>
                    </div>

                    {/* Tournament Info */}
                    <div className="space-y-3 mb-4">
                      {/* Date */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(tournament.startDate)} -{" "}
                          {formatDate(tournament.endDate)}
                        </span>
                      </div>

                      {/* Prize Pool */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <div className="text-sm">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPrizePool(
                              tournament.prizePool,
                              tournament.currency
                            )}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            (Татвар: {tournament.tax}%)
                          </span>
                        </div>
                      </div>

                      {/* Net Prize Pool */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm">
                          Цэвэр шагнал:{" "}
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPrizePool(
                              calculateNetPrizePool(
                                tournament.prizePool,
                                tournament.tax
                              ),
                              tournament.currency
                            )}
                          </span>
                        </span>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {tournament.currentParticipants}/
                          {tournament.maxParticipants} оролцогч
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{tournament.location}</span>
                      </div>

                      {/* Registration Deadline */}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Бүртгэлийн хугацаа:{" "}
                          {formatDate(tournament.registrationDeadline)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
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

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {tournament.description}
                    </p>

                    {/* Action Button */}
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="block"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300"
                      >
                        Дэлгэрэнгүй үзэх
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredTournaments.length === 0 && tournaments.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Тэмцээн олдсонгүй
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Одоогоор таны хайсан тэмцээн байхгүй байна. Дахин хайж үзнэ
                  үү.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
