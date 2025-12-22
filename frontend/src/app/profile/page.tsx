"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import MatchHistory from "./components/MatchHistory";
import AchievementRewards from "./components/AchievementRewards";

interface PlayerProfile {
  id: string;
  name: string;
  avatar?: string;
  inGameName: string;
  elo?: number;
  wins?: number;
  losses?: number;
  kills?: number;
  deaths?: number;
  totalMatches?: number;
  updatedAt?: string;
}

interface MatchHistoryItem {
  id: string;
  opponent: { name: string; avatar: string; tag?: string };
  mapPlayed: string;
  eloChange: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Fetch profile, match history, and badges in parallel
      const [profileRes, matchesRes, badgesRes] = await Promise.all([
        fetch(API_ENDPOINTS.PLAYER_PROFILES.MY_PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.MATCHES.HISTORY, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(API_ENDPOINTS.ACHIEVEMENTS.MY_BADGES, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      } else if (profileRes.status === 404) {
        router.push("/create-profile");
        return;
      } else {
        setError("Failed to load profile");
      }

      // Process match history
      if (matchesRes?.ok) {
        const matchData = await matchesRes.json();
        const formattedMatches = (matchData.matches || []).map(
          (match: any) => ({
            id: match._id || match.id,
            opponent: {
              name: match.opponent?.name || match.opponentName || "Unknown",
              avatar: match.opponent?.avatar || "/default-avatar.png",
              tag: match.opponent?.tag || match.opponentTag,
            },
            mapPlayed: match.map || match.mapPlayed || "Ranked Match",
            eloChange: match.eloChange || 0,
          })
        );
        setMatchHistory(formattedMatches);
      }

      // Process badges
      if (badgesRes?.ok) {
        const badgeData = await badgesRes.json();
        const formattedBadges = (badgeData.badges || []).map((badge: any) => ({
          id: badge._id || badge.id,
          name: badge.name,
          icon: badge.icon || "🏆",
          earned: badge.earned !== false,
        }));
        setBadges(formattedBadges);
      }
    } catch {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  // Calculate stats from profile (use real data, fallback to 0)
  const wins = profile?.wins || 0;
  const losses = profile?.losses || 0;
  const totalMatches = profile?.totalMatches || wins + losses;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
  const kills = profile?.kills || 0;
  const deaths = profile?.deaths || 0;
  const kdRatio = deaths > 0 ? kills / deaths : 0;
  const elo = profile?.elo || 1000;

  // Format last edited date
  const formatLastEdited = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
          <Navigation />
          <main className="pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
                <p className="mt-4 text-gray-300">Loading profile...</p>
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
      <ProtectedRoute requireAuth>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
          <Navigation />
          <main className="pt-20 pb-16">
            <div className="max-w-2xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-8 text-center"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-4">
                  Profile Not Found
                </h1>
                <p className="text-gray-300 mb-6">
                  You haven&apos;t created your player profile yet.
                </p>
                <Link
                  href="/create-profile"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            <ProfileHeader
              avatar={profile.avatar}
              nickname={profile.inGameName || profile.name}
              lastEdited={formatLastEdited(profile.updatedAt)}
              elo={elo}
              onEditClick={() => router.push("/settings")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfileStats
                  winRate={winRate}
                  kdRatio={kdRatio}
                  totalMatches={totalMatches}
                />
              </div>
              <div className="lg:col-span-1">
                <MatchHistory matches={matchHistory} />
              </div>
            </div>

            <AchievementRewards badges={badges} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
