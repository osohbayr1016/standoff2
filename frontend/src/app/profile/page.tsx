"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Shield,
  Sword,
  Zap,
  Monitor,
  Smartphone,
  Edit,
  Save,
  X,
  AlertCircle,
  Plus,
  Youtube,
  Twitter,
  Instagram,
  Twitch,
  MessageCircle,
  Globe,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ImageUploader from "../components/ImageUploader";
import YouTubeVideoInput from "../components/YouTubeVideoInput";
import FaceitIntegration from "../components/FaceitIntegration";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

interface PlayerProfile {
  id: string;
  name: string;
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
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<PlayerProfile>>({});

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        console.error("No token available");
        setError("Authentication required");
        return;
      }

      console.log(
        "🔍 Debug - Fetching profile with token:",
        token ? "Token exists" : "No token"
      );

      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.MY_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔍 Debug - Profile response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditData(data.profile);
      } else if (response.status === 404) {
        router.push("/create-profile");
      } else if (response.status === 401) {
        console.error("Authentication error - invalid token");
        setError("Authentication error: Invalid token");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Profile fetch error:", errorData);
        setError("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    console.log("🔍 Debug - User state:", { user });
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      console.log("🔍 Debug - Saving profile data:", editData);
      console.log("🔍 Debug - Highlight video:", editData.highlightVideo);

      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.UPDATE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      console.log("🔍 Debug - Save response status:", response.status);

      const data = await response.json();
      console.log("🔍 Debug - Save response data:", data);

      if (response.ok) {
        setProfile(data.profile);
        setIsEditing(false);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        const parentValue = prev[parent as keyof typeof prev] as
          | Record<string, string>
          | undefined;
        return {
          ...prev,
          [parent]: {
            ...(parentValue || {}),
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleImageUpload = (url: string, publicId: string) => {
    setEditData((prev) => ({
      ...prev,
      avatar: url,
      avatarPublicId: publicId,
    }));
  };

  const handleImageRemove = () => {
    setEditData((prev) => ({
      ...prev,
      avatar: undefined,
      avatarPublicId: undefined,
    }));
  };

  const handleVideoChange = (url: string) => {
    console.log("🔍 Debug - Video change called with URL:", url);
    setEditData((prev) => {
      const newData = {
        ...prev,
        highlightVideo: url,
      };
      console.log("🔍 Debug - Updated editData:", newData);
      return newData;
    });
  };

  const handleVideoRemove = () => {
    setEditData((prev) => ({
      ...prev,
      highlightVideo: undefined,
    }));
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Carry":
      case "Duelist":
      case "Assault":
      case "Fighter":
      case "ADC":
      case "DPS":
        return <Sword className="w-6 h-6" />;
      case "Support":
      case "Hard Support":
      case "Sentinel":
        return <Shield className="w-6 h-6" />;
      case "Mid":
      case "Mage":
      case "Initiator":
      case "Controller":
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

  if (loading) {
    return (
      <ProtectedRoute requireAuth requirePlayer requireProfile>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navigation />
          <main className="pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-green-400 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Loading profile...
                </p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
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
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Profile Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You haven&apos;t created your player profile yet.
                </p>
                <Link
                  href="/create-profile"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Profile</span>
                </Link>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth requirePlayer requireProfile>
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    My Profile
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage your player profile and settings
                  </p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

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

            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Player Image */}
                <div className="relative">
                  {isEditing ? (
                    <ImageUploader
                      currentImage={profile.avatar}
                      onImageUpload={handleImageUpload}
                      onImageRemove={handleImageRemove}
                      className="max-w-xs"
                    />
                  ) : (
                    <Image
                      src={profile.avatar || "/default-avatar.png"}
                      alt={profile.name}
                      width={200}
                      height={200}
                      className="rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                    />
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {profile.inGameName}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(profile.category)}
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {profile.category}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {profile.game}
                    </span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(profile.role)}
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {profile.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        In-Game Name
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.inGameName || ""}
                          onChange={(e) =>
                            handleInputChange("inGameName", e.target.value)
                          }
                          className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-green-500 outline-none w-full"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {profile.inGameName}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Rank
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.rank || ""}
                          onChange={(e) =>
                            handleInputChange("rank", e.target.value)
                          }
                          className="text-lg font-semibold text-purple-600 dark:text-green-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-green-500 outline-none w-full"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-purple-600 dark:text-green-400">
                          {profile.rank}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Experience
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.experience || ""}
                          onChange={(e) =>
                            handleInputChange("experience", e.target.value)
                          }
                          className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-green-500 outline-none w-full"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {profile.experience}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {profile.isLookingForTeam && (
                      <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                        Баг Хайж Байна
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bio Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Bio
              </h2>
              {isEditing ? (
                <textarea
                  value={editData.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about your gaming experience..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {profile.bio}
                </p>
              )}
            </motion.div>

            {/* Social Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Social Links
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  {Object.entries({
                    twitter: "Twitter",
                    instagram: "Instagram",
                    youtube: "YouTube",
                    twitch: "Twitch",
                    discord: "Discord",
                    website: "Website",
                  }).map(([platform, label]) => (
                    <div key={platform} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        {getSocialIcon(platform)}
                      </div>
                      <input
                        type="text"
                        placeholder={`Your ${label} ${
                          platform === "discord" ? "username" : "URL"
                        }`}
                        value={
                          editData.socialLinks?.[
                            platform as keyof typeof editData.socialLinks
                          ] || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            `socialLinks.${platform}`,
                            e.target.value
                          )
                        }
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
                      />
                      {(editData.socialLinks?.[
                        platform as keyof typeof editData.socialLinks
                      ] ||
                        profile.socialLinks?.[
                          platform as keyof typeof profile.socialLinks
                        ]) && (
                        <button
                          onClick={() =>
                            handleInputChange(`socialLinks.${platform}`, "")
                          }
                          className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          title={`Remove ${label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tip:</strong> Add your social media links to help
                      other players connect with you. For Discord, you can enter
                      your username (e.g., &quot;username#1234&quot;).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.socialLinks &&
                  Object.entries(profile.socialLinks).filter(([, link]) => link)
                    .length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(profile.socialLinks)
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
                            <div className="text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-green-400 transition-colors">
                              {getSocialIcon(platform)}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {platform}
                            </span>
                          </motion.a>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <Globe className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No social links added yet. Click &quot;Edit
                        Profile&quot; to add your social media links.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* FACEIT Integration Section */}
            {profile.game === "CS2" || profile.game === "Counter-Strike 2" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <FaceitIntegration
                  playerGame={profile.game}
                  onFaceitDataUpdate={(faceitData) => {
                    console.log("FACEIT data updated:", faceitData);
                  }}
                />
              </motion.div>
            ) : null}

            {/* YouTube Highlight Video Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Highlight Video
              </h2>
              {isEditing ? (
                <YouTubeVideoInput
                  currentVideo={profile.highlightVideo}
                  onVideoChange={handleVideoChange}
                  onVideoRemove={handleVideoRemove}
                />
              ) : (
                <>
                  {profile.highlightVideo ? (
                    <div className="space-y-4">
                      <div
                        className="relative w-full"
                        style={{ paddingBottom: "56.25%" }}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                            profile.highlightVideo
                          )}`}
                          title={`${profile.name} Highlight Video`}
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
                          href={profile.highlightVideo}
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
                      <p className="text-gray-600 dark:text-gray-300">
                        Add a highlight video to showcase your skills.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
