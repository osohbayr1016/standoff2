"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Shield,
  Sword,
  Zap,
  Monitor,
  Smartphone,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import ImageUploader from "../components/ImageUploader";
import YouTubeVideoInput from "../components/YouTubeVideoInput";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

interface GameOption {
  id: string;
  name: string;
  category: "PC" | "Mobile";
  roles: string[];
  ranks: string[];
}

const gameOptions: GameOption[] = [
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    category: "Mobile",
    roles: ["Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support"],
    ranks: [
      "Warrior",
      "Elite",
      "Master",
      "Grandmaster",
      "Epic",
      "Legend",
      "Mythic",
      "Mythical Glory",
      "+Mythical Immortal",
    ],
  },
];

interface ProfileFormData {
  category: "PC" | "Mobile";
  game: string;
  role: string;
  realName: string;
  inGameName: string;
  rank: string;
  experience: string;
  bio: string;
  avatar?: string;
  avatarPublicId?: string;
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
  achievements: string[];
  preferredRoles: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    timezone: string;
    preferredHours: string;
  };
  languages: string[];
}

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, hasProfile, checkProfileStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    category: "Mobile",
    game: "Mobile Legends",
    role: "",
    realName: "",
    inGameName: "",
    rank: "",
    experience: "",
    bio: "",
    socialLinks: {},
    highlightVideo: "",
    isLookingForTeam: true,
    achievements: [],
    preferredRoles: [],
    availability: {
      weekdays: true,
      weekends: true,
      timezone: "Asia/Ulaanbaatar",
      preferredHours: "18:00-22:00",
    },
    languages: ["Mongolian"],
  });

  useEffect(() => {
    if (user?.role !== "PLAYER") {
      router.push("/");
      return;
    }

    // Check if user already has a profile
    if (hasProfile) {
      router.push("/profile");
      return;
    }

    // Set the real name from user data
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        realName: user.name,
      }));
    }

    // Double-check profile status from server
    checkProfileStatus().then(() => {
      if (hasProfile) {
        router.push("/profile");
      }
    });
  }, [user, hasProfile, router, checkProfileStatus]);

  const handleGameSelect = (game: GameOption) => {
    setSelectedGame(game);
    setFormData((prev) => ({
      ...prev,
      category: game.category,
      game: game.name,
      role: "",
      rank: "",
    }));
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (url: string, publicId: string) => {
    console.log("🔍 Debug - handleImageUpload called:", { url, publicId });
    setFormData((prev) => {
      const newData = {
        ...prev,
        avatar: url,
        avatarPublicId: publicId,
      };
      console.log("🔍 Debug - Updated formData:", newData);
      return newData;
    });
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: undefined,
      avatarPublicId: undefined,
    }));
  };

  const handleVideoChange = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      highlightVideo: url,
    }));
  };

  const handleVideoRemove = () => {
    setFormData((prev) => ({
      ...prev,
      highlightVideo: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Debug: Log the form data being sent
      console.log("🔍 Debug - Form data being sent:", formData);
      console.log("🔍 Debug - Avatar URL:", formData.avatar);
      console.log("🔍 Debug - Avatar Public ID:", formData.avatarPublicId);

      // Ensure avatar data is included in the request
      const requestData = {
        ...formData,
        avatar: formData.avatar || undefined,
        avatarPublicId: formData.avatarPublicId || undefined,
      };

      console.log("🔍 Debug - Final request data:", requestData);

      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Update profile status in auth context
        await checkProfileStatus();
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setError(data.message || "Profile creation failed");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      setError("Profile creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Carry":
      case "Duelist":
      case "Assault":
      case "Fighter":
      case "ADC":
      case "DPS":
        return <Sword className="w-5 h-5" />;
      case "Support":
      case "Hard Support":
      case "Sentinel":
        return <Shield className="w-5 h-5" />;
      case "Mid":
      case "Mage":
      case "Initiator":
      case "Controller":
        return <Zap className="w-5 h-5" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: "PC" | "Mobile") => {
    return category === "PC" ? (
      <Monitor className="w-5 h-5" />
    ) : (
      <Smartphone className="w-5 h-5" />
    );
  };

  if (success) {
    return (
      <ProtectedRoute requireAuth requirePlayer>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navigation />
          <main className="pt-20 pb-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Profile Created Successfully!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your profile has been created and is now visible to other
                  players and teams.
                </p>
                <div className="animate-pulse">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to your profile...
                  </p>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth requirePlayer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />

        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your Player Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Showcase your gaming skills and connect with teams
              </p>
            </motion.div>

            <form onSubmit={handleSubmit}>
              {/* Game Selection: fixed to Mobile Legends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Game
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Mobile Legends
                </p>
              </motion.div>

              {/* Profile Details */}
              {true && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Profile Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {gameOptions[0].roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleInputChange("role", role)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              formData.role === role
                                ? "border-purple-500 dark:border-green-500 bg-purple-50 dark:bg-green-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-green-300"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(role)}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {role}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rank Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rank *
                      </label>
                      <select
                        value={formData.rank}
                        onChange={(e) =>
                          handleInputChange("rank", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Rank</option>
                        {gameOptions[0].ranks.map((rank) => (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Real Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Жинхэнэ нэр *
                      </label>
                      <input
                        type="text"
                        value={formData.realName}
                        onChange={(e) =>
                          handleInputChange("realName", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                        placeholder="Таны жинхэнэ нэр"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Энэ нэр зөвхөн профайлын дэлгэрэнгүй хуудсанд харагдана
                      </p>
                    </div>

                    {/* In-Game Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Тоглоомын нэр *
                      </label>
                      <input
                        type="text"
                        value={formData.inGameName}
                        onChange={(e) =>
                          handleInputChange("inGameName", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                        placeholder="Таны тоглоомын нэр (username)"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Энэ нэр тоглогчдын жагсаалтад харагдана
                      </p>
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Experience *
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) =>
                          handleInputChange("experience", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Experience</option>
                        <option value="Less than 1 year">
                          Less than 1 year
                        </option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="2-3 years">2-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Profile Image
                    </label>
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      onImageRemove={handleImageRemove}
                      className="max-w-xs"
                    />
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio *
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us about your gaming experience, achievements, and what you're looking for..."
                      required
                    />
                  </div>

                  {/* YouTube Highlight Video */}
                  <div className="mt-6">
                    <YouTubeVideoInput
                      onVideoChange={handleVideoChange}
                      onVideoRemove={handleVideoRemove}
                    />
                  </div>

                  {/* Looking for Team */}
                  <div className="mt-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.isLookingForTeam}
                        onChange={(e) =>
                          handleInputChange(
                            "isLookingForTeam",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 dark:text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        I&apos;m looking for a team
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300">
                      {error}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              {selectedGame && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Create Profile</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
