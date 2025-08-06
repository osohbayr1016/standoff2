"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function TestCorsPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testCors = async () => {
    setLoading(true);
    setTestResult("Testing...");

    try {
      console.log("Testing CORS with URL:", API_ENDPOINTS.HEALTH);

      const response = await fetch(API_ENDPOINTS.HEALTH, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        setTestResult(
          `✅ CORS Test Successful!\nStatus: ${
            response.status
          }\nData: ${JSON.stringify(data, null, 2)}`
        );
      } else {
        const errorText = await response.text();
        setTestResult(
          `❌ CORS Test Failed!\nStatus: ${response.status}\nError: ${errorText}`
        );
      }
    } catch (error) {
      console.error("CORS test error:", error);
      setTestResult(
        `❌ CORS Test Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setTestResult("Testing registration...");

    try {
      const testUrl = API_ENDPOINTS.AUTH.REGISTER;
      console.log("🔧 Generated URL:", testUrl);
      console.log(
        "🔧 API_BASE_URL:",
        API_ENDPOINTS.AUTH.LOGIN.replace("/api/auth/login", "")
      );

      const response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          role: "PLAYER",
        }),
        credentials: "include",
      });

      console.log("Registration response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        setTestResult(
          `✅ Registration Test Successful!\nStatus: ${
            response.status
          }\nData: ${JSON.stringify(data, null, 2)}`
        );
      } else {
        const errorText = await response.text();
        setTestResult(
          `❌ Registration Test Failed!\nStatus: ${response.status}\nError: ${errorText}`
        );
      }
    } catch (error) {
      console.error("Registration test error:", error);
      setTestResult(
        `❌ Registration Test Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            CORS Test Page
          </h1>

          <div className="space-y-4 mb-8">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Frontend URL:</strong>{" "}
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "Unknown"}
              </p>
              <p>
                <strong>API Base URL:</strong>{" "}
                {API_ENDPOINTS.AUTH.LOGIN.replace("/api/auth/login", "")}
              </p>
              <p>
                <strong>Registration URL:</strong> {API_ENDPOINTS.AUTH.REGISTER}
              </p>
              <p>
                <strong>Health Check URL:</strong> {API_ENDPOINTS.HEALTH}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={testCors}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test CORS (Health Check)"}
            </button>

            <button
              onClick={testRegistration}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Registration"}
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                Test Result:
              </h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto">
                {testResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
