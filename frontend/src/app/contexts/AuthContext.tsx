"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "PLAYER" | "ORGANIZATION" | "COACH" | "ADMIN";
  isVerified: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  checkProfileStatus: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management utilities
const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const setStoredToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

const removeStoredToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasProfile");
  }
};

const getStoredUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        removeStoredToken();
        return null;
      }
    }
  }
  return null;
};

const setStoredUser = (user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

const getStoredHasProfile = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hasProfile") === "true";
  }
  return false;
};

const setStoredHasProfile = (hasProfile: boolean): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hasProfile", hasProfile.toString());
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      const userData = getStoredUser();
      const storedHasProfile = getStoredHasProfile();

      if (token && userData) {
        try {
          // Validate token with server
          const response = await fetch(API_ENDPOINTS.AUTH.ME, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setHasProfile(storedHasProfile);

            // If user is a player or organization, check profile status
            if (
              data.user.role === "PLAYER" ||
              data.user.role === "ORGANIZATION"
            ) {
              await checkProfileStatus();
            }
          } else {
            // Token is invalid, clear storage
            removeStoredToken();
            setUser(null);
            setHasProfile(false);
          }
        } catch (error) {
          console.error("Error validating token:", error);
          removeStoredToken();
          setUser(null);
          setHasProfile(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Automatic token refresh failed:", error);
        // If refresh fails, logout the user
        await logout();
      }
    }, 6 * 24 * 60 * 60 * 1000); // Refresh every 6 days (before 7-day expiration)

    return () => clearInterval(refreshInterval);
  }, [user]);

  const checkProfileStatus = async () => {
    if (!user || (user.role !== "PLAYER" && user.role !== "ORGANIZATION")) {
      setHasProfile(false);
      setStoredHasProfile(false);
      return;
    }

    try {
      const token = getStoredToken();
      if (!token) return;

      const endpoint =
        user.role === "PLAYER"
          ? API_ENDPOINTS.PLAYER_PROFILES.HAS_PROFILE
          : API_ENDPOINTS.ORGANIZATION_PROFILES.HAS_PROFILE;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasProfile(data.hasProfile);
        setStoredHasProfile(data.hasProfile);
      }
    } catch (error) {
      console.error("Error checking profile status:", error);
      setHasProfile(false);
      setStoredHasProfile(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorMessage = "Нэвтрэхэд алдаа гарлаа";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Нэвтрэхэд алдаа гарлаа");
      }

      setStoredToken(data.token);
      setStoredUser(data.user);
      setUser(data.user);

      // Check profile status for players and organizations
      if (data.user.role === "PLAYER" || data.user.role === "ORGANIZATION") {
        await checkProfileStatus();
      }
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Нэвтрэхэд алдаа гарлаа";
      throw new Error(errorMessage);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorMessage = "Бүртгүүлэхэд алдаа гарлаа";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Бүртгүүлэхэд алдаа гарлаа");
      }

      setStoredToken(data.token);
      setStoredUser(data.user);
      setUser(data.user);

      // For new players and organizations, they don't have a profile yet
      if (data.user.role === "PLAYER" || data.user.role === "ORGANIZATION") {
        setHasProfile(false);
        setStoredHasProfile(false);
      }
    } catch (error: unknown) {
      console.error("❌ Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Бүртгүүлэхэд алдаа гарлаа";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        // Call logout endpoint to update server state
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeStoredToken();
      setUser(null);
      setHasProfile(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setStoredUser(updatedUser);
    }
  };

  const refreshToken = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("No token available");
      }

      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Token refresh failed");
      }

      setStoredToken(data.token);
      setStoredUser(data.user);
      setUser(data.user);
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    hasProfile,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    checkProfileStatus,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
