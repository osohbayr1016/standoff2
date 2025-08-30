import React, { useState, useEffect } from "react";
import { SquadDivision, DivisionLeaderboardEntry } from "@/types/division";
import { DivisionService } from "@/services/divisionService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface DivisionLeaderboardProps {
  division: SquadDivision;
}

export default function DivisionLeaderboard({
  division,
}: DivisionLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<DivisionLeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [division]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await DivisionService.getDivisionLeaderboard(division);
      setLeaderboard(data);
    } catch (err) {
      setError("Failed to fetch leaderboard");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-600 bg-yellow-100";
      case 1:
        return "text-gray-600 bg-gray-100";
      case 2:
        return "text-amber-600 bg-amber-100";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No squads found in this division yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Squad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Coins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Earned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <tr
                key={entry._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRankColor(
                      index
                    )}`}
                  >
                    {getRankIcon(index)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {entry.tag.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.name}
                      </div>
                      <div className="text-sm text-gray-500">{entry.tag}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.currentBountyCoins.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">coins</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.totalBountyCoinsEarned.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">total</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Level {entry.level}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Showing {leaderboard.length} squads</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
