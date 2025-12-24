"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import socketService from "../../services/socketService";
import ActiveFriendsSection from "./components/ActiveFriendsSection";
import FriendSearchSection from "./components/FriendSearchSection";
import FriendRequestCard from "./components/FriendRequestCard";

interface Friend {
  id: string;
  userId: string;
  name: string;
  inGameName: string;
  standoff2Id?: string;
  avatar?: string;
  elo: number;
  isOnline: boolean;
  wins?: number;
  losses?: number;
}

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    standoff2Id?: string;
    elo?: number;
  };
  createdAt: Date;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingRequest, setProcessingRequest] = useState(false);

  const fetchFriends = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.FRIENDS.ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      } else {
        const data = await response.json();
        console.error("Failed to fetch friends:", data.message);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [getToken]);

  const fetchRequests = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.FRIENDS.INCOMING_REQUESTS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [getToken]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchRequests()]);
      setLoading(false);
    };

    if (user) {
      loadData();

      // Setup socket connection
      const token = getToken();
      if (token && !socketService.isConnected()) {
        socketService.connect(token);
      }

      // Socket event listeners
      socketService.onFriendRequestReceived(() => {
        fetchRequests();
      });

      socketService.onFriendsListUpdated(() => {
        fetchFriends();
      });

      socketService.onFriendStatusChanged((data) => {
        setFriends((prev) =>
          prev.map((f) =>
            f.userId === data.friendId
              ? { ...f, isOnline: data.status === "online" }
              : f
          )
        );
      });
    }

    return () => {
      socketService.removeAllListeners("friend_request_received");
      socketService.removeAllListeners("friends_list_updated");
      socketService.removeAllListeners("friend_status_changed");
    };
  }, [user, getToken, fetchFriends, fetchRequests]);

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(true);
    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.FRIENDS.ACCEPT(requestId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        await fetchFriends();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      setError("Failed to accept request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequest(true);
    try {
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.FRIENDS.REJECT(requestId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        const data = await response.json();
        setError(data.message || "Failed to decline request");
      }
    } catch (error) {
      console.error("Error declining request:", error);
      setError("Failed to decline request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleMessage = (friendId: string) => {
    router.push(`/messages?userId=${friendId}`);
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
                <p className="mt-4 text-gray-300">Loading friends..</p>
              </div>
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
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-2">Friends</h1>
              <p className="text-gray-400">
                Manage your friends and connect with players
              </p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-300">{error}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActiveFriendsSection
                  friends={friends}
                  onMessage={handleMessage}
                />
              </div>

              <div className="space-y-6">
                <FriendSearchSection
                  getToken={getToken}
                  onRequestSent={fetchRequests}
                />

                <div className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Pending Requests
                    </h2>
                    {requests.length > 0 && (
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {requests.length}
                      </span>
                    )}
                  </div>

                  {requests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {requests.map((request) => (
                        <FriendRequestCard
                          key={request.id}
                          request={request}
                          onAccept={handleAcceptRequest}
                          onDecline={handleDeclineRequest}
                          isProcessing={processingRequest}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
