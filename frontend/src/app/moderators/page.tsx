"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import ProtectedRoute from "../components/ProtectedRoute";
import ModeratorHeader from "./components/ModeratorHeader";
import SearchAndFilters from "./components/SearchAndFilters";
import ResultsList from "./components/ResultsList";

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
  const { getToken } = useAuth();
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

      const statusParam = filter === "reviewed" ? "APPROVED" : filter === "disputed" ? "REJECTED" : "";
      const endpoint = filter === "pending" 
        ? API_ENDPOINTS.MODERATOR.MATCH_RESULTS.PENDING
        : statusParam ? `${API_ENDPOINTS.MODERATOR.MATCH_RESULTS.ALL}?status=${statusParam}` : API_ENDPOINTS.MODERATOR.MATCH_RESULTS.ALL;

      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401 || response.status === 403) {
        setError("You don't have permission to access this page");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const results = Array.isArray(data.data) ? data.data : [];
      filter === "pending" ? setPendingResults(results) : setReviewedResults(results);
      if (!response.ok) setError(data.message || "Failed to fetch results");
    } catch (err: any) {
      setError(err.message || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resultId: string, winnerTeam: "alpha" | "bravo", winnerTeamName: string) => {
    if (!window.confirm(`Confirm ${winnerTeamName} as the winner? All players will receive +25 ELO for winners and -25 ELO for losers.`)) return;

    try {
      setActionLoading(resultId);
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.MODERATOR.MATCH_RESULTS.APPROVE(resultId), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ winnerTeam }),
      });
      if (!response.ok) throw new Error("Failed to approve result");
      await fetchResults();
    } catch (err: any) {
      setError(err.message || "Failed to approve result");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (resultId: string) => {
    if (!window.confirm("Are you sure you want to reject/dispute this match result?")) return;

    try {
      setActionLoading(resultId);
      const token = getToken();
      const response = await fetch(API_ENDPOINTS.MODERATOR.MATCH_RESULTS.REJECT(resultId), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to reject result");
      await fetchResults();
    } catch (err: any) {
      setError(err.message || "Failed to reject result");
    } finally {
      setActionLoading(null);
    }
  };

  const filterFn = (result: MatchResult) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return result._id.toLowerCase().includes(q) || result.lobby?.teamAlpha?.[0]?.inGameName?.toLowerCase().includes(q) || result.lobby?.teamBravo?.[0]?.inGameName?.toLowerCase().includes(q);
  };

  return (
    <ProtectedRoute requireModerator>
      <div className="min-h-screen flex flex-col bg-[#0f1419]">
        <main className="flex-1 pt-16">
          <div className="min-h-screen bg-gradient-to-b from-[#1a1d29] via-[#2a3a4a] to-[#1a2a3a] pt-20 relative overflow-hidden px-4">
            <div className="relative z-10 max-w-7xl mx-auto py-12">
              <ModeratorHeader />
              <div className="mt-8 flex flex-col items-center w-full max-w-6xl">
                <SearchAndFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} filter={filter} setFilter={setFilter} />
                {error && <div className="w-full mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-200">{error}</div>}
                {loading ? <div className="py-12 text-white">Loading...</div> : (
                  <div className="w-full space-y-6">
                    <ResultsList filter={filter} results={(filter === "pending" ? pendingResults : reviewedResults).filter(filterFn)} onApprove={handleApprove} onReject={handleReject} actionLoading={actionLoading} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
