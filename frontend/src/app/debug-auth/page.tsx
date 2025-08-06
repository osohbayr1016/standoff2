"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "@/config/api";

export default function DebugAuthPage() {
  const { user, loading, getToken, isAuthenticated } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [authTest, setAuthTest] = useState<any>(null);
  const [profileTest, setProfileTest] = useState<any>(null);

  useEffect(() => {
    // Get localStorage data
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const hasProfile = localStorage.getItem("hasProfile");

    setLocalStorageData({
      token: token ? `${token.substring(0, 20)}...` : null,
      tokenLength: token?.length || 0,
      user: userData ? JSON.parse(userData) : null,
      hasProfile: hasProfile === "true",
    });
  }, []);

  const testAuth = async () => {
    try {
      const token = getToken();
      if (!token) {
        setAuthTest({ error: "No token available" });
        return;
      }

      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setAuthTest({
        status: response.status,
        data: data,
      });
    } catch (error) {
      setAuthTest({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const testProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setProfileTest({ error: "No token available" });
        return;
      }

      const response = await fetch(API_ENDPOINTS.PLAYER_PROFILES.MY_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setProfileTest({
        status: response.status,
        data: data,
      });
    } catch (error) {
      setProfileTest({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AuthContext State */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </p>
              <p>
                <strong>Is Authenticated:</strong>{" "}
                {isAuthenticated ? "Yes" : "No"}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {user ? JSON.stringify(user, null, 2) : "None"}
              </p>
            </div>
          </div>

          {/* LocalStorage Data */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
            <div className="space-y-2">
              <p>
                <strong>Token:</strong> {localStorageData.token || "None"}
              </p>
              <p>
                <strong>Token Length:</strong> {localStorageData.tokenLength}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {localStorageData.user
                  ? JSON.stringify(localStorageData.user, null, 2)
                  : "None"}
              </p>
              <p>
                <strong>Has Profile:</strong>{" "}
                {localStorageData.hasProfile ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* Auth Test */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Auth Test</h2>
            <button
              onClick={testAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
            >
              Test Auth Endpoint
            </button>
            {authTest && (
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(authTest, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Profile Test */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Profile Test</h2>
            <button
              onClick={testProfile}
              className="px-4 py-2 bg-green-500 text-white rounded mb-4"
            >
              Test Profile Endpoint
            </button>
            {profileTest && (
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(profileTest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
