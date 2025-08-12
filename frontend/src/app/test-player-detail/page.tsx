"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api";

export default function TestPlayerDetailPage() {
  const [data, setData] = useState<{ profile?: { name?: string } } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState("6893639943aecce8b3e0c69c");

  const testPlayerDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        "Testing player detail endpoint:",
        API_ENDPOINTS.PLAYER_PROFILES.GET(playerId)
      );

      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.GET(playerId));
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      setData(result);
    } catch (err) {
      console.error("Error testing player detail API:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    testPlayerDetail();
  }, [testPlayerDetail]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Player Detail API Test</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoint</h2>
          <p className="text-gray-600 font-mono">
            {API_ENDPOINTS.PLAYER_PROFILES.GET(playerId)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Player ID</h2>
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter player ID"
          />
        </div>

        {loading && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-800">
              Success!
            </h2>
            <div className="mb-4">
              <h3 className="font-semibold text-green-700">
                Player found: {data.profile?.name || "Unknown"}
              </h3>
            </div>
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Raw Response:</h3>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <button
          onClick={testPlayerDetail}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Test Again
        </button>
      </div>
    </div>
  );
}
