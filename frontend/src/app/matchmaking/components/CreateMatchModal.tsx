import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Users, Coins, Calendar, Lock, Globe } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../contexts/AuthContext";

interface CreateMatchModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userSquad: any;
}

export default function CreateMatchModal({
  onClose,
  onSuccess,
  userSquad,
}: CreateMatchModalProps) {
  const { user, getToken } = useAuth();
  const [type, setType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [bountyAmount, setBountyAmount] = useState<number>(10);
  const [deadline, setDeadline] = useState<string>("");
  const [opponentSquadId, setOpponentSquadId] = useState<string>("");
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSquads, setLoadingSquads] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (type === "PRIVATE") {
      fetchSquads();
    }
  }, [type]);

  const fetchSquads = async () => {
    setLoadingSquads(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_ENDPOINTS.SQUADS.ALL}?limit=100&isActive=true`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched squads data:", data);
      if (data.success) {
        // Өөрийн squad-ыг хасах, зөвхөн идэвхтэй болон хангалттай гишүүнтэй squad-уудыг харуулах
        const filteredSquads = data.squads.filter((s: any) => 
          s._id !== userSquad?._id && 
          s.isActive === true && 
          s.members && s.members.length >= 5
        );
        console.log("Filtered squads:", filteredSquads);
        setSquads(filteredSquads);
      } else {
        console.error("Failed to fetch squads:", data.message);
        setError("Squad-ууд татахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error fetching squads:", error);
      setError("Squad-ууд татахад алдаа гарлаа");
    } finally {
      setLoadingSquads(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userSquad) {
      setError("Та squad үүсгэх хэрэгтэй");
      return;
    }

    if (userSquad.members.length < 5) {
      setError("Squad-д хамгийн багадаа 5 гишүүн байх ёстой");
      return;
    }

    // Check if current user is the squad leader
    if (!user || userSquad.leader._id !== user.id) {
      setError("Зөвхөн squad leader match үүсгэх эрхтэй");
      return;
    }

    if (userSquad.currentBountyCoins < bountyAmount) {
      setError("Хангалтгүй bounty coin байна");
      return;
    }

    if (type === "PRIVATE" && !opponentSquadId) {
      setError("Opponent squad сонгоно уу");
      return;
    }

    if (!deadline) {
      setError("Deadline сонгоно уу");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      console.log(`🔍 Creating match with data:`, {
        type,
        bountyAmount,
        deadline,
        opponentSquadId: type === "PRIVATE" ? opponentSquadId : undefined,
      });
      
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({
          type,
          bountyAmount,
          deadline,
          opponentSquadId: type === "PRIVATE" ? opponentSquadId : undefined,
        }),
      });

      console.log(`📡 Create match response status: ${response.status}`);
      const data = await response.json();
      console.log(`📊 Create match response data:`, data);

      if (data.success) {
        console.log(`✅ Match created successfully`);
        onSuccess();
      } else {
        console.error(`❌ Match creation failed: ${data.message}`);
        setError(data.message || "Алдаа гарлаа");
      }
    } catch (error) {
      console.error(`❌ Match creation error:`, error);
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
          <h2 className="text-2xl font-bold text-white">Тоглолт үүсгэх</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-white mb-2">Төрөл</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("PUBLIC")}
                className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                  type === "PUBLIC"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                <Globe className="w-5 h-5" />
                Public
              </button>
              <button
                type="button"
                onClick={() => setType("PRIVATE")}
                className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                  type === "PRIVATE"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                <Lock className="w-5 h-5" />
                Private
              </button>
            </div>
          </div>

          {/* Private: Opponent Squad Selection */}
          {type === "PRIVATE" && (
            <div>
              <label className="block text-white mb-2">Opponent Squad</label>
              <select
                value={opponentSquadId}
                onChange={(e) => setOpponentSquadId(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg"
                required
                disabled={loadingSquads}
              >
                <option value="">
                  {loadingSquads ? "Squad-ууд татаж байна..." : "Сонгох..."}
                </option>
                {squads.map((squad) => (
                  <option key={squad._id} value={squad._id}>
                    {squad.name} [{squad.tag}] ({squad.members.length}/5)
                  </option>
                ))}
              </select>
              {squads.length === 0 && !loadingSquads && (
                <div className="text-yellow-500 text-sm mt-1">
                  <p>Өөр squad байхгүй байна</p>
                  <p className="text-xs text-gray-400 mt-1">
                    (Зөвхөн идэвхтэй болон 5+ гишүүнтэй squad-уудыг харуулна)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bounty Amount */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <Coins className="w-5 h-5" />
              Bounty Coin ({userSquad?.currentBountyCoins || 0} байгаа)
            </label>
            <input
              type="number"
              value={bountyAmount}
              onChange={(e) => setBountyAmount(Number(e.target.value))}
              className="w-full bg-gray-700 text-white p-3 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <Calendar className="w-5 h-5" />
              Тоглолт эхлэх цаг
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Огноо</label>
                <input
                  type="date"
                  value={deadline ? deadline.split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = deadline ? deadline.split('T')[1] : '12:00';
                    setDeadline(`${date}T${time}`);
                  }}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Цаг</label>
                <input
                  type="time"
                  value={deadline ? deadline.split('T')[1] : '12:00'}
                  onChange={(e) => {
                    const date = deadline ? deadline.split('T')[0] : new Date().toISOString().split('T')[0];
                    const time = e.target.value;
                    setDeadline(`${date}T${time}`);
                  }}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Тоглолт: {deadline && deadline.trim() ? new Date(deadline).toLocaleString('mn-MN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Огноо сонгоно уу'}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Үүсгэж байна..." : "Үүсгэх"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
