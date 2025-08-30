"use client";

import React, { useState, useEffect } from "react";
import { SquadDivision, DivisionConfig } from "@/types/division";
import { DivisionService } from "@/services/divisionService";
import DivisionCard from "@/components/divisions/DivisionCard";
import DivisionLeaderboard from "@/components/divisions/DivisionLeaderboard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState<DivisionConfig[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SquadDivision>(
    SquadDivision.SILVER
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const divisionsData = await DivisionService.getDivisionsInfo();
      setDivisions(divisionsData);
    } catch (err) {
      setError("Failed to fetch divisions");
      console.error("Error fetching divisions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDivisions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Division System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Compete in tournaments to earn Bounty Coins and climb the
              divisions. Each division offers unique challenges and rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Division Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {divisions.map((division) => (
            <DivisionCard
              key={division.name}
              division={division}
              isSelected={selectedDivision === division.name}
              onSelect={() => setSelectedDivision(division.name)}
            />
          ))}
        </div>

        {/* Division Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {DivisionService.getDivisionDisplayName(selectedDivision)}{" "}
              Leaderboard
            </h2>
            <p className="text-gray-600 mt-1">
              Top squads in{" "}
              {DivisionService.getDivisionDisplayName(
                selectedDivision
              ).toLowerCase()}
            </p>
          </div>
          <DivisionLeaderboard division={selectedDivision} />
        </div>
      </div>

      {/* Division Rules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Division Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Progression
              </h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    All squads start in <strong>Silver Division</strong> (0-250
                    Bounty Coins)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    Reach 250 coins to upgrade to <strong>Gold Division</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    Reach 750 coins to upgrade to{" "}
                    <strong>Diamond Division</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Diamond Division has unlimited progression</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Protection System
              </h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  <span>
                    Each squad gets <strong>2 protections</strong> when reaching
                    0 coins
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  <span>Protections prevent division demotion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  <span>Protections reset on wins and division changes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span>
                    Lose 2 matches without protection = division demotion
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Bounty Coin System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  Silver Division
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  50 coins = 10,000 MNT
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  Win: +50, Lose: -25
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  Gold Division
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  50 coins = 20,000 MNT
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  Win: +50, Lose: -25
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  Diamond Division
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  50 coins = 30,000 MNT
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  Win: +50, Lose: -25
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
