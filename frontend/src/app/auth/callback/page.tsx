"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          setMessage("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
          return;
        }

        if (!token) {
          setStatus("error");
          setMessage("Токен олдсонгүй. Дахин оролдоно уу.");
          return;
        }

        // Store the token
        localStorage.setItem("token", token);

        // Fetch user data
        const response = await fetch(API_ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.user) {
          // Store user data
          localStorage.setItem("user", JSON.stringify(data.user));

          // Update auth context
          updateUser(data.user);

          setStatus("success");
          setMessage("Амжилттай нэвтэрлээ!");

          // Check if user is a player or organization and redirect accordingly
          if (data.user.role === "PLAYER") {
            // Check if player has a profile
            try {
              const profileResponse = await fetch(
                API_ENDPOINTS.PLAYER_PROFILES.HAS_PROFILE,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                if (profileData.hasProfile) {
                  // Player has profile, redirect to home
                  setTimeout(() => {
                    router.push("/");
                  }, 1500);
                } else {
                  // Player doesn't have profile, redirect to create profile
                  setTimeout(() => {
                    router.push("/create-profile");
                  }, 1500);
                }
              } else {
                // Error checking profile, redirect to home
                setTimeout(() => {
                  router.push("/");
                }, 1500);
              }
            } catch (error) {
              console.error("Error checking profile:", error);
              // Error checking profile, redirect to home
              setTimeout(() => {
                router.push("/");
              }, 1500);
            }
          } else if (data.user.role === "ORGANIZATION") {
            // Check if organization has a profile
            try {
              const profileResponse = await fetch(
                API_ENDPOINTS.ORGANIZATION_PROFILES.HAS_PROFILE,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                if (profileData.hasProfile) {
                  // Organization has profile, redirect to home
                  setTimeout(() => {
                    router.push("/");
                  }, 1500);
                } else {
                  // Organization doesn't have profile, redirect to create organization profile
                  setTimeout(() => {
                    router.push("/create-organization-profile");
                  }, 1500);
                }
              } else {
                // Error checking profile, redirect to home
                setTimeout(() => {
                  router.push("/");
                }, 1500);
              }
            } catch (error) {
              console.error("Error checking organization profile:", error);
              // Error checking profile, redirect to home
              setTimeout(() => {
                router.push("/");
              }, 1500);
            }
          } else {
            // Other user types, redirect to home
            setTimeout(() => {
              router.push("/");
            }, 1500);
          }
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
      }
    };

    handleCallback();
  }, [searchParams, router, updateUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Нэвтэрч байна...
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Түр хүлээнэ үү</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Амжилттай!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Алдаа гарлаа
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <button
                onClick={() => router.push("/auth/login")}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Нэвтрэх хуудас руу буцах
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
