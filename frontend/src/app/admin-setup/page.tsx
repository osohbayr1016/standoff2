"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, CheckCircle, AlertCircle } from "lucide-react";
import Navigation from "../components/Navigation";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" &&
          window.location.hostname !== "localhost"
            ? "https://e-sport-connection-0596.onrender.com"
            : "http://localhost:8000")
        }/api/users/update-role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            role: "ADMIN",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Success! ${email} is now an admin. You can now access the admin panel.`
        );
        setIsSuccess(true);
        setEmail("");
      } else {
        setMessage(`Error: ${data.message}`);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage(
        "Error: Could not connect to server. Make sure your backend is running."
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Setup
              </h1>
              <p className="text-gray-400">
                Make yourself an admin to access the admin panel
              </p>
            </div>

            <form onSubmit={handleMakeAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This must be the email you used to register your account
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Making Admin...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Make Me Admin</span>
                  </>
                )}
              </button>
            </form>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg border ${
                  isSuccess
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : "bg-red-500/20 border-red-500/30 text-red-400"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message}</span>
                </div>
              </motion.div>
            )}

            <div className="mt-8 p-4 bg-gray-700/30 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Instructions:
              </h3>
              <ol className="text-sm text-gray-400 space-y-1">
                <li>1. Enter the email address you used to register</li>
                <li>2. Click &quot;Make Me Admin&quot;</li>
                <li>3. Log out and log back in</li>
                <li>
                  4. You should now see &quot;Admin&quot; in the navigation
                </li>
                <li>5. Click &quot;Admin&quot; to access the admin panel</li>
              </ol>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                ⚠️ This page should be removed in production for security
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
