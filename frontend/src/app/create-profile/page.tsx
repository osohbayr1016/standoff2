"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Gamepad2, Save, AlertCircle, Loader2, Hash } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CreateProfilePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    inGameName: "",
    standoff2Id: "",
    bio: "",
    category: "Mobile" as "PC" | "Mobile",
    game: "Standoff 2",
    roles: ["Rifler"],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.inGameName.trim()) {
      setError("Please enter your in-game name");
      return;
    }

    if (formData.inGameName.length < 3) {
      setError("In-game name must be at least 3 characters");
      return;
    }

    if (!formData.standoff2Id.trim()) {
      setError("Please enter your Standoff 2 ID");
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/profile");
      } else {
        setError(data.message || "Failed to create profile");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1d29] to-[#252836] rounded-2xl border border-orange-500/20 p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create Your Profile
              </h1>
              <p className="text-gray-400">
                Set up your player profile to start competing
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* In-Game Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  In-Game Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="inGameName"
                    value={formData.inGameName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                    placeholder="Enter your in-game name"
                  />
                </div>
              </div>

              {/* Standoff 2 ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Standoff 2 ID *
                </label>
                <p className="text-xs text-orange-400/80 mb-3 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                  Таны оруулсан ID автоматаар тоглолт эхлэх үед copy хийгдэх тул
                  заавал зөв оруулснаар та тоглолт эхлүүлэхэд илүү хялбар болох
                  юм.
                </p>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="standoff2Id"
                    value={formData.standoff2Id}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                    placeholder="Enter your Standoff 2 ID"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none disabled:opacity-50"
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-300">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Profile
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
