import { motion } from "framer-motion";
import {
  Users,
  Coins,
  Calendar,
  Trophy,
  Clock,
  Lock,
  Globe,
} from "lucide-react";
import Image from "next/image";

interface MatchCardProps {
  match: any;
  onClick: () => void;
  userSquad: any;
}

export default function MatchCard({
  match,
  onClick,
  userSquad,
}: MatchCardProps) {
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      PENDING: {
        bg: "bg-yellow-500",
        text: "text-yellow-900",
        label: "Хүлээж байна",
      },
      ACCEPTED: {
        bg: "bg-blue-500",
        text: "text-blue-900",
        label: "Accept хийгдсэн",
      },
      PLAYING: {
        bg: "bg-green-500",
        text: "text-green-900",
        label: "Тоглож байна",
      },
      RESULT_SUBMITTED: {
        bg: "bg-orange-500",
        text: "text-orange-900",
        label: "Үр дүн оруулсан",
      },
      COMPLETED: { bg: "bg-gray-500", text: "text-gray-900", label: "Дууссан" },
      DISPUTED: { bg: "bg-red-500", text: "text-red-900", label: "Маргаантай" },
      CANCELLED: {
        bg: "bg-gray-600",
        text: "text-gray-900",
        label: "Цуцлагдсан",
      },
    };

    const style = statusStyles[status] || statusStyles.PENDING;

    return (
      <span
        className={`${style.bg} ${style.text} px-3 py-1 rounded-full text-xs font-semibold`}
      >
        {style.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      return "Өнгөрсөн";
    }

    if (hours > 24) {
      return `${Math.floor(hours / 24)} өдөр`;
    }

    if (hours > 0) {
      return `${hours}ц ${minutes}м`;
    }

    return `${minutes}м`;
  };

  const isUserMatch =
    userSquad &&
    (match.challengerSquadId._id === userSquad._id ||
      match.opponentSquadId?._id === userSquad._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-gray-800 rounded-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
        isUserMatch ? "ring-2 ring-purple-500" : ""
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {match.type === "PRIVATE" ? (
            <Lock className="w-5 h-5 text-purple-400" />
          ) : (
            <Globe className="w-5 h-5 text-blue-400" />
          )}
          <span className="text-gray-400 text-sm">{match.type}</span>
        </div>
        {getStatusBadge(match.status)}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center flex-1">
          {match.challengerSquadId.logo ? (
            <Image
              src={match.challengerSquadId.logo}
              alt={match.challengerSquadId.name}
              width={50}
              height={50}
              className="rounded-full mb-2"
            />
          ) : (
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
          )}
          <p className="text-white font-semibold text-sm text-center">
            {match.challengerSquadId.name}
          </p>
          <p className="text-gray-400 text-xs">
            [{match.challengerSquadId.tag}]
          </p>
        </div>

        <div className="px-4">
          <p className="text-2xl font-bold text-purple-400">VS</p>
        </div>

        <div className="flex flex-col items-center flex-1">
          {match.opponentSquadId ? (
            <>
              {match.opponentSquadId.logo ? (
                <Image
                  src={match.opponentSquadId.logo}
                  alt={match.opponentSquadId.name}
                  width={50}
                  height={50}
                  className="rounded-full mb-2"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
              )}
              <p className="text-white font-semibold text-sm text-center">
                {match.opponentSquadId.name}
              </p>
              <p className="text-gray-400 text-xs">
                [{match.opponentSquadId.tag}]
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Хүлээж байна</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>Bounty:</span>
          </div>
          <span className="font-semibold text-yellow-400">
            {match.bountyAmount}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Цаг:</span>
          </div>
          <span className="font-semibold">{formatDate(match.deadline)}</span>
        </div>
      </div>

      {/* Winner Badge */}
      {match.winnerId && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">
              {match.winnerId === match.challengerSquadId._id
                ? match.challengerSquadId.name
                : match.opponentSquadId?.name}{" "}
              ялалт
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
