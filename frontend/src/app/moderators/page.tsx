"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, FileText, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import ProtectedRoute from "../components/ProtectedRoute";
import MatchResultCard from "./components/MatchResultCard";

interface MatchResult {
  _id: string;
  matchLobbyId: any;
  submittedBy: any;
  screenshots: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedBy?: any;
  reviewedAt?: string;
  winnerTeam?: "alpha" | "bravo";
  moderatorNotes?: string;
  lobby?: {
    _id: string;
    teamAlpha: any[];
    teamBravo: any[];
    selectedMap?: string;
    players: any[];
  };
}

export default function ModeratorsPage() {
  const { user, getToken } = useAuth();
  const [pendingResults, setPendingResults] = useState<MatchResult[]>([]);
  const [reviewedResults, setReviewedResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "disputed">("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [filter]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      let endpoint: string;
      if (filter === "pending") {
        endpoint = API_ENDPOINTS.MODERATOR.MATCH_RESULTS.PENDING;
      } else {
        const statusParam = filter === "reviewed" ? "APPROVED" : filter === "disputed" ? "REJECTED" : "";
        endpoint = statusParam 
          ? `${API_ENDPOINTS.MODERATOR.MATCH_RESULTS.ALL}?status=${statusParam}`
          : API_ENDPOINTS.MODERATOR.MATCH_RESULTS.ALL;
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle authentication/authorization errors gracefully
      if (response.status === 401 || response.status === 403) {
        setError("You don't have permission to access this page");
        setLoading(false);
        return;
      }

      // Always try to parse response
      let data: any = { success: false, data: [] };
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        // If JSON parsing fails but status is ok, treat as empty results
        if (response.ok) {
          if (filter === "pending") {
            setPendingResults([]);
          } else {
            setReviewedResults([]);
          }
          setLoading(false);
          return;
        }
        // For non-ok responses, we'll handle below
      }

      // Extract results - always use data.data if available, default to empty array
      const results = Array.isArray(data.data) ? data.data : [];
      
      if (filter === "pending") {
        setPendingResults(results);
      } else {
        setReviewedResults(results);
      }

      // Handle errors - only show error for real failures, not empty results
      if (response.ok) {
        // Response is successful - clear error (even if results are empty)
        setError(null);
      } else if (response.status >= 500) {
        // Server errors - show error
        setError(data.message || "Server error occurred");
      } else if (response.status >= 400 && data.success === false) {
        // Client errors that are explicit failures
        setError(data.message || "Failed to fetch match results");
      } else if (data.success === true) {
        // If success is explicitly true, clear error (edge case)
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      // Only show error for network errors or unexpected failures
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to fetch match results");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resultId: string, winnerTeam: "alpha" | "bravo") => {
    if (!window.confirm(`Confirm ${winnerTeam === "alpha" ? "Team Alpha" : "Team Bravo"} as the winner? All players will receive +25 ELO for winners and -25 ELO for losers.`)) {
      return;
    }

    try {
      setActionLoading(resultId);
      setError(null);
      const token = getToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.MODERATOR.MATCH_RESULTS.APPROVE(resultId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ winnerTeam }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve result");
      }

      // Refresh results
      await fetchResults();
    } catch (err: any) {
      console.error("Error approving result:", err);
      setError(err.message || "Failed to approve result");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (resultId: string) => {
    if (!window.confirm("Are you sure you want to reject/dispute this match result?")) {
      return;
    }

    try {
      setActionLoading(resultId);
      setError(null);
      const token = getToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.MODERATOR.MATCH_RESULTS.REJECT(resultId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject result");
      }

      // Refresh results
      await fetchResults();
    } catch (err: any) {
      console.error("Error rejecting result:", err);
      setError(err.message || "Failed to reject result");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPendingResults = pendingResults.filter((result) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      result._id.toLowerCase().includes(query) ||
      (result.lobby?.teamAlpha?.[0]?.inGameName?.toLowerCase().includes(query)) ||
      (result.lobby?.teamBravo?.[0]?.inGameName?.toLowerCase().includes(query))
    );
  });

  const filteredReviewedResults = reviewedResults.filter((result) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      result._id.toLowerCase().includes(query) ||
      (result.lobby?.teamAlpha?.[0]?.inGameName?.toLowerCase().includes(query)) ||
      (result.lobby?.teamBravo?.[0]?.inGameName?.toLowerCase().includes(query))
    );
  });

  return (
    <ProtectedRoute requireModerator>
      <div className="min-h-screen flex flex-col bg-[#0f1419]">
        <main className="flex-1 pt-16">
          <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 relative overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
              <div className="flex flex-col items-center justify-center min-h-[70vh] relative px-4">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mb-8"
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    Moderator Panel
                  </h1>
                </motion.div>

                <div className="mt-8 flex flex-col items-center w-full max-w-6xl">
                  {/* Search and Filters */}
                  <div className="w-full mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by Match ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setFilter("pending")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                          filter === "pending"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Pending
                      </button>
                      <button
                        onClick={() => setFilter("reviewed")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                          filter === "reviewed"
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Reviewed
                      </button>
                      <button
                        onClick={() => setFilter("disputed")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                          filter === "disputed"
                            ? "bg-red-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Disputed
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="w-full mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-200">
                      {error}
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="w-full text-center py-12">
                      <div className="text-white text-lg">Loading...</div>
                    </div>
                  )}

                  {/* Results */}
                  {!loading && (
                    <div className="w-full space-y-6">
                      {/* Pending Match Verifications */}
                      {filter === "pending" && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-4">
                            Pending Match Verifications ({filteredPendingResults.length})
                          </h2>
                          {filteredPendingResults.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                              No pending match results
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {filteredPendingResults.map((result) => (
                                <MatchResultCard
                                  key={result._id}
                                  result={result}
                                  onApprove={handleApprove}
                                  onReject={handleReject}
                                  loading={actionLoading === result._id}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Moderation History */}
                      {filter !== "pending" && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-4">
                            Moderation History ({filteredReviewedResults.length})
                          </h2>
                          {filteredReviewedResults.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                              No {filter === "reviewed" ? "reviewed" : "disputed"} match results
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {filteredReviewedResults.map((result) => (
                                <MatchResultCard
                                  key={result._id}
                                  result={result}
                                  onApprove={handleApprove}
                                  onReject={handleReject}
                                  loading={actionLoading === result._id}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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

