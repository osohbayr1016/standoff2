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
  prizeDistribution: {
    firstPlace: number;
    secondPlace: number;
    thirdPlace: number;
  };
  currency: string;
  maxSquads: number;
  currentSquads: number;
  format: string;
  entryFee: number;
  location: string;
  bannerImage?: string;
  organizerLogo?: string;
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

// Tournament data transformation function
interface RawTournamentData {
  _id: string;
  name: string;
  game: string;
  description: string;
  organizer?: string;
  organizerLogo?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  prizePool: number;
  prizeDistribution?: {
    firstPlace: number;
    secondPlace: number;
    thirdPlace: number;
  };
  maxSquads?: number;
  maxParticipants?: number;
  currentSquads?: number;
  currentParticipants?: number;
  format?: string;
  entryFee?: number;
  location?: string;
  bannerImage?: string;
  status: string;
  rules?: string;
  createdAt: string;
}

const transformTournamentData = (
  tournament: RawTournamentData
): Tournament => ({
  id: tournament._id,
  name: tournament.name,
  game: tournament.game,
  gameIcon: `/games/${tournament.game
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(":", "")}.png`,
  description: tournament.description,
  organizer: {
    id: tournament.organizer || "unknown",
    name: tournament.organizer || "Unknown Organizer",
    logo: tournament.organizerLogo || "/default-avatar.png",
    isVerified: false,
  },
  startDate: tournament.startDate,
  endDate: tournament.endDate,
  registrationDeadline:
    tournament.registrationDeadline || new Date().toISOString(),
  prizePool: tournament.prizePool,
  prizeDistribution: tournament.prizeDistribution || {
    firstPlace: Math.round(tournament.prizePool * 0.5),
    secondPlace: Math.round(tournament.prizePool * 0.3),
    thirdPlace: Math.round(tournament.prizePool * 0.2),
  },
  currency: "MNT",
  maxSquads: tournament.maxSquads || tournament.maxParticipants || 16,
  currentSquads:
    tournament.currentSquads || tournament.currentParticipants || 0,
  format: tournament.format || "Single Elimination",
  entryFee: tournament.entryFee || 5000,
  location: tournament.location || "Онлайн",
  bannerImage: tournament.bannerImage,
  organizerLogo: tournament.organizerLogo,
  status:
    tournament.status === "upcoming"
      ? "registration_open"
      : tournament.status === "ongoing"
      ? "ongoing"
      : tournament.status === "completed"
      ? "completed"
      : "registration_closed",
  requirements: [], // Default empty requirements
  rules: tournament.rules ? [tournament.rules] : [],
  createdAt: tournament.createdAt,
});

export default function TournamentDetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchTournament = async () => {
      if (!params.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/tournaments/${params.id}`);

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.tournament) {
            const transformedTournament = transformTournamentData(
              data.tournament
            );
            setTournament(transformedTournament);
          } else {
            setTournament(null);
          }
        } else {
          console.error("Failed to fetch tournament:", response.status);
          setTournament(null);
        }
      } catch (error) {
        console.error("Error fetching tournament:", error);
        setTournament(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [params.id]);

  // Countdown timer effect
  useEffect(() => {
    if (!tournament) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = new Date(tournament.registrationDeadline).getTime();
      const difference = deadline - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [tournament]);

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

  const canRegister = (status: Tournament["status"], deadline: string) => {
    // For testing purposes, allow registration if status is registration_open
    // In production, you might want to check the deadline: && new Date(deadline) > new Date()
    return status === "registration_open";
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) <= new Date();
  };

  const handleRegistration = async () => {
    if (!tournament) return;

    setIsRegistering(true);
    setRegistrationMessage("");

    try {
      // Step 1: Check if user has authentication (mock for now)
      const userHasAuth = true; // In real app, check from auth context

      if (!userHasAuth) {
        setRegistrationMessage("Та нэвтрэх шаардлагатай байна.");
        return;
      }

      // Step 2: Check if user has a squad for this game
      const userSquadsResponse = await fetch(
        `/api/squads?game=${encodeURIComponent(tournament.game)}`
      );
      const userSquadsData = await userSquadsResponse.json();

      if (!userSquadsData.success || userSquadsData.squads.length === 0) {
        setRegistrationMessage(
          "Та энэ тоглоомд squad үүсгэх шаардлагатай байна. Squad хуудсанд очоод squad үүсгэнэ үү."
        );
        return;
      }

      const userSquad = userSquadsData.squads[0]; // Get first squad for this game

      // Step 3: Check if squad meets requirements (5-7 members)
      const squadMemberCount = userSquad.members.length + 1; // +1 for leader
      if (squadMemberCount < 5 || squadMemberCount > 7) {
        setRegistrationMessage(
          `Squad-д ${squadMemberCount} гишүүн байна. Тэмцээнд оролцохын тулд 5-7 гишүүнтэй байх шаардлагатай.`
        );
        return;
      }

      // Step 4: Check if tournament is full
      if (tournament.currentSquads >= tournament.maxSquads) {
        setRegistrationMessage("Тэмцээн дүүрэн байна. Бүртгэл хаагдсан.");
        return;
      }

      // Step 5: Simulate payment processing
      setRegistrationMessage("Төлбөр боловсруулж байна...");

      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 6: Register the squad for the tournament
      const registrationResponse = await fetch(
        `/api/tournaments/${tournament.id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            squadId: userSquad._id,
            entryFee: tournament.entryFee,
            currency: tournament.currency,
          }),
        }
      );

      if (!registrationResponse.ok) {
        throw new Error("Registration failed");
      }

      const registrationData = await registrationResponse.json();

      if (registrationData.success) {
        setRegistrationMessage(
          `🎉 Амжилттай бүртгэгдлээ! "${userSquad.name}" squad таны оролцоотой боллоо.`
        );

        // Update tournament data to reflect new participant count
        setTournament((prev) =>
          prev
            ? {
                ...prev,
                currentSquads: prev.currentSquads + 1,
              }
            : null
        );
      } else {
        throw new Error(registrationData.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering for tournament:", error);
      setRegistrationMessage(
        error instanceof Error
          ? error.message
          : "Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу."
      );
    } finally {
      setIsRegistering(false);
    }
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
                  Бүртгэлийн төлбөр: {tournament.entryFee} {tournament.currency}
                </div>
              </div>

              <div className="text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tournament.currentSquads}/{tournament.maxSquads}
                </div>
                <div className="text-sm text-gray-500">Багууд</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (tournament.currentSquads / tournament.maxSquads) * 100
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
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Squad бүртгэл
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

            {/* Tournament Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Тэмцээний хуваарь
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    Бүртгэлийн хугацаа
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(tournament.registrationDeadline)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    Тэмцээн эхлэх
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(tournament.startDate)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    Тэмцээн дуусах
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(tournament.endDate)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Формат</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {tournament.format}
                  </div>
                </div>
              </div>
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

              {/* Countdown Timer */}
              {canRegister(
                tournament.status,
                tournament.registrationDeadline
              ) && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 text-center">
                    {new Date(tournament.registrationDeadline) > new Date()
                      ? "Бүртгэлийн хугацаа дуусах"
                      : "Бүртгэл нээлттэй (тестийн горимд)"}
                  </div>
                  {new Date(tournament.registrationDeadline) > new Date() ? (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white dark:bg-gray-700 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {timeLeft.days}
                        </div>
                        <div className="text-xs text-gray-500">Хоног</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {timeLeft.hours}
                        </div>
                        <div className="text-xs text-gray-500">Цаг</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {timeLeft.minutes}
                        </div>
                        <div className="text-xs text-gray-500">Минут</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {timeLeft.seconds}
                        </div>
                        <div className="text-xs text-gray-500">Секунд</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-blue-600 dark:text-blue-400 font-medium">
                      Тестийн горимд бүртгэл нээлттэй
                    </div>
                  )}

                  {/* Deadline Warning */}
                  {isDeadlinePassed(tournament.registrationDeadline) && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
                        ⚠️ Бүртгэлийн хугацаа дууссан, гэхдээ тестийн горимд
                        бүртгэл хийх боломжтой
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canRegister(
                tournament.status,
                tournament.registrationDeadline
              ) ? (
                <>
                  <motion.button
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-300 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {registrationMessage === "Төлбөр боловсруулж байна..."
                          ? "Төлбөр боловсруулж байна..."
                          : "Бүртгэж байна..."}
                      </div>
                    ) : new Date(tournament.registrationDeadline) >
                      new Date() ? (
                      "Squad-аар бүртгүүлэх"
                    ) : (
                      "Squad-аар бүртгүүлэх (Тест - Хугацаа дууссан)"
                    )}
                  </motion.button>

                  {registrationMessage && (
                    <div
                      className={`text-sm p-3 rounded-lg mb-4 ${
                        registrationMessage.includes("Амжилттай") ||
                        registrationMessage.includes("🎉")
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                          : registrationMessage.includes("Squad үүсгэх") ||
                            registrationMessage.includes("гишүүнтэй") ||
                            registrationMessage.includes("дүүрэн")
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      <div className="mb-2">{registrationMessage}</div>
                      {registrationMessage.includes("Squad үүсгэх") && (
                        <Link href="/squads">
                          <button className="text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 underline text-sm">
                            Squad үүсгэх →
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 py-3 px-4 rounded-lg font-medium text-center mb-4">
                  {tournament.status === "registration_closed"
                    ? "Бүртгэл хаагдсан"
                    : "Бүртгэл нээлттэй биш"}
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
                  <span>Squad шаардлага:</span>
                  <span className="font-medium">5-7 гишүүн</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span>Төлбөр:</span>
                  <span className="font-medium">
                    {tournament.entryFee} {tournament.currency}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Prize Pool Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Шагналын тархалт
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    1-р байр
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrizePool(
                      tournament.prizeDistribution.firstPlace,
                      tournament.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    2-р байр
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrizePool(
                      tournament.prizeDistribution.secondPlace,
                      tournament.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    3-р байр
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrizePool(
                      tournament.prizeDistribution.thirdPlace,
                      tournament.currency
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Бүртгэлийн төлбөр
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {tournament.entryFee} {tournament.currency}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
