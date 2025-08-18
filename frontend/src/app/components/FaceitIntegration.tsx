"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  Shield,
  Trophy,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import { API_ENDPOINTS } from "../../config/api";

interface FaceitData {
  nickname: string;
  level: number;
  elo: number;
  country: string;
  gamePlayerStats?: {
    averageKD: number;
    averageKR: number;
    averageHeadshots: number;
    winRate: number;
    matches: number;
  };
  lastUpdated: string;
}

interface FaceitIntegrationProps {
  playerGame: string;
  onFaceitDataUpdate?: (data: FaceitData | null) => void;
}

export default function FaceitIntegration({
  playerGame,
  onFaceitDataUpdate,
}: FaceitIntegrationProps) {
  const [isLinked, setIsLinked] = useState(false);
  const [faceitData, setFaceitData] = useState<FaceitData | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [faceitNickname, setFaceitNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);

  // Check if player's game supports FACEIT (only CS2)
  const isCS2Player = playerGame === "CS2" || playerGame === "Counter-Strike 2";

  useEffect(() => {
    if (isCS2Player) {
      checkFaceitStatus();
    }
  }, [isCS2Player]);

  const checkFaceitStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.FACEIT.STATUS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setIsLinked(data.isLinked);
        setFaceitData(data.faceitData);
        setNeedsRefresh(data.needsRefresh);

        if (onFaceitDataUpdate) {
          onFaceitDataUpdate(data.faceitData);
        }
      }
    } catch (error) {
      console.error("Error checking FACEIT status:", error);
    }
  };

  const handleVerifyNickname = async () => {
    if (!faceitNickname.trim()) {
      setError("FACEIT nickname оруулна уу");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.FACEIT.VERIFY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: faceitNickname.trim() }),
      });

      const data = await response.json();
      if (data.success && data.exists) {
        setSuccess("FACEIT аккаунт олдлоо! Холбох боломжтой.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("FACEIT аккаунт олдсонгүй. Nickname-ээ дахин шалгана уу.");
      }
    } catch (error) {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!faceitNickname.trim()) {
      setError("FACEIT nickname оруулна уу");
      return;
    }

    setIsLinking(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.FACEIT.LINK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ faceitNickname: faceitNickname.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setIsLinked(true);
        setFaceitData(data.faceitData);
        setShowLinkForm(false);
        setFaceitNickname("");
        setSuccess("FACEIT аккаунт амжилттай холбогдлоо!");

        if (onFaceitDataUpdate) {
          onFaceitDataUpdate(data.faceitData);
        }

        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.message || "FACEIT аккаунт холбоход алдаа гарлаа");
      }
    } catch (error) {
      setError("Серверийн алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (!confirm("FACEIT аккаунтыг салгахдаа итгэлтэй байна уу?")) {
      return;
    }

    setIsLinking(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.FACEIT.UNLINK, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setIsLinked(false);
        setFaceitData(null);
        setNeedsRefresh(false);
        setSuccess("FACEIT аккаунт амжилттай салгагдлаа");

        if (onFaceitDataUpdate) {
          onFaceitDataUpdate(null);
        }

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "FACEIT аккаунт салгахад алдаа гарлаа");
      }
    } catch (error) {
      setError("Серверийн алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.FACEIT.REFRESH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFaceitData(data.faceitData);
        setNeedsRefresh(false);
        setSuccess("FACEIT мэдээлэл шинэчлэгдлээ!");

        if (onFaceitDataUpdate) {
          onFaceitDataUpdate(data.faceitData);
        }

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Мэдээлэл шинэчлэхэд алдаа гарлаа");
      }
    } catch (error) {
      setError("Серверийн алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getFaceitLevelColor = (level: number): string => {
    const colors = [
      "#9e9e9e", // Level 1 - Gray
      "#4caf50", // Level 2 - Green
      "#8bc34a", // Level 3 - Light Green
      "#cddc39", // Level 4 - Lime
      "#ffeb3b", // Level 5 - Yellow
      "#ffc107", // Level 6 - Amber
      "#ff9800", // Level 7 - Orange
      "#ff5722", // Level 8 - Deep Orange
      "#e91e63", // Level 9 - Pink
      "#9c27b0", // Level 10 - Purple
    ];
    return colors[level - 1] || "#9e9e9e";
  };

  const formatLastUpdated = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `${diffMins} минутын өмнө`;
    } else if (diffHours < 24) {
      return `${diffHours} цагийн өмнө`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} өдрийн өмнө`;
    }
  };

  // Don't render anything if not CS2 player
  if (!isCS2Player) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              FACEIT Integration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              CS2 тоглогчидод зориулсан
            </p>
          </div>
        </div>

        {isLinked && (
          <div className="flex items-center space-x-2">
            {needsRefresh && (
              <motion.button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                title="Мэдээлэл шинэчлэх"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </motion.button>
            )}

            <motion.button
              onClick={handleUnlinkAccount}
              disabled={isLinking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
              title="FACEIT салгах"
            >
              <Unlink className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </span>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700 dark:text-green-300 text-sm">
              {success}
            </span>
          </div>
        </motion.div>
      )}

      {isLinked && faceitData ? (
        /* Linked Account Display */
        <div className="space-y-4">
          {/* FACEIT Profile Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className="w-3 h-3 rounded-full border-2 border-white absolute -top-1 -right-1 z-10"
                  style={{
                    backgroundColor: getFaceitLevelColor(faceitData.level),
                  }}
                ></div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                  {faceitData.level}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {faceitData.nickname}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Level {faceitData.level}</span>
                  <span>•</span>
                  <span>{faceitData.elo} ELO</span>
                  {faceitData.country && (
                    <>
                      <span>•</span>
                      <span>{faceitData.country}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <motion.a
              href={`https://www.faceit.com/en/players/${faceitData.nickname}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">FACEIT Profile</span>
            </motion.a>
          </div>

          {/* Stats Grid */}
          {faceitData.gamePlayerStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    K/D
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {faceitData.gamePlayerStats.averageKD.toFixed(2)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Win Rate
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {faceitData.gamePlayerStats.winRate.toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    HS%
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {faceitData.gamePlayerStats.averageHeadshots.toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Matches
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {faceitData.gamePlayerStats.matches}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-indigo-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    K/R
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {faceitData.gamePlayerStats.averageKR.toFixed(2)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Updated
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {formatLastUpdated(faceitData.lastUpdated)}
                </div>
              </div>
            </div>
          )}

          {/* Refresh Notice */}
          {needsRefresh && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-300 text-sm">
                  Мэдээлэл хуучирсан байна. Шинэчлэх товчийг дарна уу.
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Link Account Form */
        <div className="space-y-4">
          {!showLinkForm ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                FACEIT аккаунт холбоно уу
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                CS2 дээрх FACEIT level болон ELO-г бодит цагт харуулахын тулд
                аккаунтаа холбоно уу
              </p>
              <motion.button
                onClick={() => setShowLinkForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span>FACEIT холбох</span>
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FACEIT Nickname
                </label>
                <input
                  type="text"
                  value={faceitNickname}
                  onChange={(e) => setFaceitNickname(e.target.value)}
                  placeholder="Таны FACEIT nickname"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent"
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleVerifyNickname()
                  }
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Жишээ: player123 (FACEIT профайл дээрх нэрээ оруулна уу)
                </p>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={handleVerifyNickname}
                  disabled={isVerifying || !faceitNickname.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 border border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Шалгаж байна...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Шалгах</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleLinkAccount}
                  disabled={isLinking || !faceitNickname.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLinking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Холбож байна...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      <span>Холбох</span>
                    </>
                  )}
                </motion.button>
              </div>

              <motion.button
                onClick={() => {
                  setShowLinkForm(false);
                  setFaceitNickname("");
                  setError("");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Цуцлах
              </motion.button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
