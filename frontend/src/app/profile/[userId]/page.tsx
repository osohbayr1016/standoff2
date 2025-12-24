"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, UserPlus, Check, ArrowLeft, X } from "lucide-react";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";
import ProfileHeader from "../components/ProfileHeader";
import ProfileStats from "../components/ProfileStats";
import MatchHistory from "../components/MatchHistory";
import AchievementRewards from "../components/AchievementRewards";
import VerificationModal from "../components/VerificationModal";

interface PlayerProfile {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  inGameName: string;
  uniqueId?: string;
  elo?: number;
  wins?: number;
  losses?: number;
  kills?: number;
  deaths?: number;
  totalMatches?: number;
  isIdVerified?: boolean;
  standoff2Id?: string;
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

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, getToken } = useAuth();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [friendRequestStatus, setFriendRequestStatus] = useState<
    "none" | "pending" | "friends"
  >("none");
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchAdditionalData = useCallback(async () => {
    if (!profile) return;

    const token = getToken();
    const isOwnProfile = user?.id === profile.userId || String(user?.id) === String(profile.userId);

    // Only fetch match history and badges for own profile (requires auth)
    if (isOwnProfile && token) {
      try {
        const [matchesRes, badgesRes] = await Promise.all([
          fetch(API_ENDPOINTS.MATCHES.HISTORY, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          fetch(API_ENDPOINTS.ACHIEVEMENTS.MY_BADGES, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

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
      } catch (error) {
        console.error("[Profile] Error fetching additional data:", error);
      }
    }
  }, [profile, user, getToken]);

  useEffect(() => {
    if (profile) {
      checkFriendStatus();
      fetchAdditionalData();
    }
  }, [profile, fetchAdditionalData]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      console.log(`[Profile] Fetching profile for ID: "${userId}"`);

      // Determine ID type and prioritize lookup order
      const isMongoId = userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId);
      const looksLikeUniqueId = userId.includes('-') && userId.length > 10;

      console.log(`[Profile] ID Analysis - isMongoId: ${isMongoId}, looksLikeUniqueId: ${looksLikeUniqueId}`);

      let response;
      let attempts = [];

      // Strategy 1: If it looks like a uniqueId (contains hyphens and is longer), try that first
      if (looksLikeUniqueId) {
        console.log('[Profile] Trying uniqueId lookup first');
        attempts = [
          { name: 'uniqueId', url: API_ENDPOINTS.PLAYER_PROFILES.GET_BY_UNIQUE_ID(userId) },
          { name: 'userId', url: API_ENDPOINTS.PLAYER_PROFILES.GET_BY_USER_ID(userId) },
          ...(isMongoId ? [{ name: 'profileId', url: API_ENDPOINTS.PLAYER_PROFILES.GET(userId) }] : [])
        ];
      }
      // Strategy 2: If it's a MongoDB ObjectId, try userId lookup first (most common)
      else if (isMongoId) {
        console.log('[Profile] Trying userId lookup first (valid ObjectId)');
        attempts = [
          { name: 'userId', url: API_ENDPOINTS.PLAYER_PROFILES.GET_BY_USER_ID(userId) },
          { name: 'profileId', url: API_ENDPOINTS.PLAYER_PROFILES.GET(userId) },
          { name: 'uniqueId', url: API_ENDPOINTS.PLAYER_PROFILES.GET_BY_UNIQUE_ID(userId) }
        ];
      }
      // Strategy 3: Unknown format, try all
      else {
        console.log('[Profile] Trying all lookup methods');
        attempts = [
          { name: 'userId', url: API_ENDPOINTS.PLAYER_PROFILES.GET_BY_USER_ID(userId) },
          { name: 'uniqueId', url: API_ENDPOINTS.PLAYER_PROFILES.GET_BY_UNIQUE_ID(userId) }
        ];
      }

      // Try each endpoint until one succeeds
      for (const attempt of attempts) {
        console.log(`[Profile] Attempting ${attempt.name} lookup: ${attempt.url}`);
        response = await fetch(attempt.url, { credentials: "include" });

        if (response.ok) {
          console.log(`[Profile] SUCCESS: Found profile via ${attempt.name}`);
          break;
        } else {
          console.log(`[Profile] ${attempt.name} lookup failed: ${response.status}`);
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        const userProfile = data.profile;

        if (userProfile) {
          // Extract userId properly (handle both object and string)
          let extractedUserId: string;
          if (userProfile.userId) {
            if (typeof userProfile.userId === 'object') {
              // If populated, get _id from the object
              extractedUserId = userProfile.userId._id
                ? String(userProfile.userId._id)
                : String(userProfile.userId);
            } else {
              extractedUserId = String(userProfile.userId);
            }
          } else {
            // Fallback to the userId from params if available
            extractedUserId = userId;
          }

          console.log(`[Profile] Profile data loaded: ${userProfile.inGameName}, userId: ${extractedUserId}`);

          setProfile({
            id: userProfile._id?.toString() || userProfile.id,
            userId: extractedUserId,
            name: userProfile.inGameName || userProfile.name || "Unknown Player",
            avatar: userProfile.avatar || (userProfile.userId?.avatar),
            inGameName: userProfile.inGameName || userProfile.name || "Unknown Player",
            uniqueId: userProfile.uniqueId,
            elo: userProfile.elo || 1000,
            wins: userProfile.wins || 0,
            losses: userProfile.losses || 0,
            kills: userProfile.kills || 0,
            deaths: userProfile.deaths || 0,
            totalMatches: userProfile.totalMatches || (userProfile.wins || 0) + (userProfile.losses || 0),
            isIdVerified: userProfile.isIdVerified,
            standoff2Id: userProfile.standoff2Id,
            updatedAt: userProfile.updatedAt,
          });
        } else {
          console.log('[Profile] No profile data in response');
          setError("Profile not found");
        }
      } else if (response && response.status === 404) {
        console.log('[Profile] All lookup attempts returned 404');
        setError("Profile not found");
      } else {
        const errorData = response ? await response.json().catch(() => ({})) : {};
        console.log('[Profile] Error response:', errorData);
        setError(errorData.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("[Profile] Exception:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatus = async () => {
    try {
      const token = getToken();
      if (!token || !profile) return;

      const profileUserId = profile.userId;
      console.log(`[Friend Status] Checking for profile userId: ${profileUserId}`);

      const [friendsRes, incomingReqRes, outgoingReqRes] = await Promise.all([
        fetch(API_ENDPOINTS.FRIENDS.ALL, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.FRIENDS.INCOMING_REQUESTS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.FRIENDS.OUTGOING_REQUESTS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Check if already friends
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        const isFriend = friendsData.friends?.some(
          (f: any) => {
            const friendUserId = typeof f.userId === 'object'
              ? f.userId.toString()
              : String(f.userId);
            return friendUserId === String(profileUserId);
          }
        );
        if (isFriend) {
          console.log('[Friend Status] Already friends');
          setFriendRequestStatus("friends");
          return;
        }
      }

      // Check if there's a pending request TO this user (outgoing)
      if (outgoingReqRes.ok) {
        const outgoingData = await outgoingReqRes.json();
        const pendingRequest = outgoingData.requests?.find(
          (r: any) => {
            const receiverId = typeof r.receiver?.id === 'object'
              ? r.receiver.id.toString()
              : String(r.receiver?.id || '');
            return receiverId === String(profileUserId);
          }
        );
        if (pendingRequest) {
          console.log('[Friend Status] Pending outgoing request:', pendingRequest.id);
          setFriendRequestStatus("pending");
          setPendingRequestId(pendingRequest.id);
          return;
        }
      }

      // Check if there's a pending request FROM this user (incoming)
      if (incomingReqRes.ok) {
        const incomingData = await incomingReqRes.json();
        const hasPendingIncoming = incomingData.requests?.some(
          (r: any) => {
            const senderId = typeof r.sender?.id === 'object'
              ? r.sender.id.toString()
              : String(r.sender?.id || '');
            return senderId === String(profileUserId);
          }
        );
        if (hasPendingIncoming) {
          console.log('[Friend Status] Pending incoming request');
          setFriendRequestStatus("pending");
          return;
        }
      }

      console.log('[Friend Status] No relationship found');
      setPendingRequestId(null);
    } catch (error) {
      console.error("[Friend Status] Error:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profile) {
      console.log('[Friend Request] No profile loaded');
      return;
    }

    setSendingRequest(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setSendingRequest(false);
        return;
      }

      // Ensure receiverId is a valid MongoDB ObjectId string
      const receiverId = String(profile.userId).trim();

      // Validate it looks like a MongoDB ObjectId (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(receiverId)) {
        console.error('[Friend Request] Invalid receiverId format:', receiverId);
        setError("Invalid user ID format");
        setSendingRequest(false);
        return;
      }

      console.log(`[Friend Request] Sending request to userId: ${receiverId}`);

      const response = await fetch(API_ENDPOINTS.FRIENDS.REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Friend Request] Request sent successfully:', data);
        setFriendRequestStatus("pending");
        // Store the request ID if returned
        if (data.request?._id) {
          setPendingRequestId(data.request._id);
        }
        setError(""); // Clear any previous errors
      } else {
        const data = await response.json().catch(() => ({ message: "Unknown error" }));
        console.log('[Friend Request] Failed:', data);
        setError(data.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error("[Friend Request] Exception:", error);
      setError("Failed to send friend request");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!pendingRequestId) {
      console.log('[Cancel Request] No pending request ID');
      return;
    }

    setCancellingRequest(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setCancellingRequest(false);
        return;
      }

      console.log(`[Cancel Request] Cancelling request ID: ${pendingRequestId}`);

      const response = await fetch(API_ENDPOINTS.FRIENDS.CANCEL(pendingRequestId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        console.log('[Cancel Request] Request cancelled successfully');
        setFriendRequestStatus("none");
        setPendingRequestId(null);
        setError(""); // Clear any previous errors
      } else {
        const data = await response.json().catch(() => ({ message: "Unknown error" }));
        console.log('[Cancel Request] Failed:', data);
        setError(data.message || "Failed to cancel friend request");
      }
    } catch (error) {
      console.error("[Cancel Request] Exception:", error);
      setError("Failed to cancel friend request");
    } finally {
      setCancellingRequest(false);
    }
  };

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
    );
  }

  if (!profile) {
    return (
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
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if this is the user's own profile
  const isOwnProfile = profile
    ? (user?.id === profile.userId || String(user?.id) === String(profile.userId))
    : false;

  return (
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

          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {!isOwnProfile && user && (
              <div>
                {friendRequestStatus === "friends" ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600 rounded-lg text-green-400">
                    <Check className="w-5 h-5" />
                    <span>Friends</span>
                  </div>
                ) : friendRequestStatus === "pending" ? (
                  <button
                    onClick={handleCancelFriendRequest}
                    disabled={cancellingRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {cancellingRequest ? "Cancelling..." : "Request Sent"}
                  </button>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={sendingRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    {sendingRequest ? "Sending..." : "Add Friend"}
                  </button>
                )}
              </div>
            )}
          </div>

          <ProfileHeader
            avatar={profile.avatar}
            nickname={profile.inGameName}
            lastEdited={isOwnProfile ? formatLastEdited(profile.updatedAt) : "Public Profile"}
            elo={elo}
            uniqueId={profile.uniqueId}
            isIdVerified={profile.isIdVerified}
            onEditClick={() => router.push("/settings")}
            onVerifyClick={() => setIsVerificationModalOpen(true)}
            hideEditButton={!isOwnProfile}
          />

          {isOwnProfile && (
            <VerificationModal
              isOpen={isVerificationModalOpen}
              onClose={() => setIsVerificationModalOpen(false)}
              onSuccess={fetchProfile}
              currentStandoff2Id={profile.standoff2Id}
            />
          )}

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
  );
}

