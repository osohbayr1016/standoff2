import { useState } from "react";
import { motion } from "framer-motion";
import { X, Trophy, XCircle } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../contexts/AuthContext";

interface ResultSubmitModalProps {
  matchId: string;
  match?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResultSubmitModal({
  matchId,
  match,
  onClose,
  onSuccess,
}: ResultSubmitModalProps) {
  const { getToken } = useAuth();
  const [result, setResult] = useState<"WIN" | "LOSS" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!result) {
      setError("Үр дүн сонгоно уу");
      return;
    }

    if (
      !window.confirm(
        `Та ${result === "WIN" ? "хожсон" : "хожигдсон"} гэж батлах уу?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const response = await fetch(
        API_ENDPOINTS.MATCHES.RESULT(matchId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
          body: JSON.stringify({ result }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || "Алдаа гарлаа");
      }
    } catch (error) {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Үр дүн оруулах</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Тоглолтын үр дүнгээ сонгоно уу. Хоёр баг санал нийлвэл автоматаар
          батлагдана.
        </p>

        {/* Current Match Status */}
        {match && (match.challengerResult || match.opponentResult) && (
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="text-white font-semibold mb-3">Одоогийн үр дүн</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>{match.challengerSquadId?.name}:</span>
                <span className={`font-semibold ${
                  match.challengerResult === "WIN" ? "text-green-400" : 
                  match.challengerResult === "LOSS" ? "text-red-400" : 
                  "text-gray-400"
                }`}>
                  {match.challengerResult ? 
                    (match.challengerResult === "WIN" ? "Хожлоо" : "Хожигдлоо") : 
                    "Үр дүн оруулаагүй"
                  }
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>{match.opponentSquadId?.name || "Хүлээж байна"}:</span>
                <span className={`font-semibold ${
                  match.opponentResult === "WIN" ? "text-green-400" : 
                  match.opponentResult === "LOSS" ? "text-red-400" : 
                  "text-gray-400"
                }`}>
                  {match.opponentResult ? 
                    (match.opponentResult === "WIN" ? "Хожлоо" : "Хожигдлоо") : 
                    "Үр дүн оруулаагүй"
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setResult("WIN")}
            className={`w-full p-4 rounded-lg flex items-center justify-center gap-3 text-lg font-semibold transition-all ${
              result === "WIN"
                ? "bg-green-600 text-white scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Trophy className="w-6 h-6" />
            Бид хожлоо
          </button>

          <button
            onClick={() => setResult("LOSS")}
            className={`w-full p-4 rounded-lg flex items-center justify-center gap-3 text-lg font-semibold transition-all ${
              result === "LOSS"
                ? "bg-red-600 text-white scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <XCircle className="w-6 h-6" />
            Бид хожигдлоо
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold"
          >
            Болих
          </button>
          <button
            onClick={handleSubmit}
            disabled={!result || loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Илгээж байна..." : "Батлах"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
