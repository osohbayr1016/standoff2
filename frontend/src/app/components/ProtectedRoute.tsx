"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePlayer?: boolean;
  requireOrganization?: boolean;
  requireModerator?: boolean;
  requireProfile?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requirePlayer = false,
  requireOrganization = false,
  requireModerator = false,
  requireProfile = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, hasProfile } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // If player role is required and user is not a player
    if (requirePlayer && user?.role !== "PLAYER") {
      router.push(redirectTo || "/");
      return;
    }

    // If organization role is required and user is not an organization
    if (requireOrganization && user?.role !== "ORGANIZATION") {
      router.push(redirectTo || "/");
      return;
    }

    // If moderator role is required and user is not a moderator or admin
    if (requireModerator && user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
      router.push(redirectTo || "/");
      return;
    }

    // If profile is required and player doesn't have a profile
    if (requireProfile && user?.role === "PLAYER" && !hasProfile) {
      router.push("/create-profile");
      return;
    }

    // If profile is required and organization doesn't have a profile
    if (requireProfile && user?.role === "ORGANIZATION" && !hasProfile) {
      router.push("/create-organization-profile");
      return;
    }

    // If user has a profile but is trying to access create-profile page
    if (hasProfile && window.location.pathname === "/create-profile") {
      router.push("/profile");
      return;
    }

    // If user has a profile but is trying to access create-organization-profile page
    if (
      hasProfile &&
      window.location.pathname === "/create-organization-profile"
    ) {
      router.push("/organization-profile");
      return;
    }

    setIsChecking(false);
  }, [
    loading,
    isAuthenticated,
    user,
    hasProfile,
    requireAuth,
    requirePlayer,
    requireOrganization,
    requireModerator,
    requireProfile,
    redirectTo,
    router,
  ]);

  if (loading || isChecking) {
    return <LoadingSpinner fullScreen />;
  }

  // If authentication is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If player role is required and user is not a player, don't render children
  if (requirePlayer && user?.role !== "PLAYER") {
    return null;
  }

  // If organization role is required and user is not an organization, don't render children
  if (requireOrganization && user?.role !== "ORGANIZATION") {
    return null;
  }

  // If moderator role is required and user is not a moderator or admin, don't render children
  if (requireModerator && user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
    return null;
  }

  // If profile is required and player doesn't have a profile, don't render children
  if (requireProfile && user?.role === "PLAYER" && !hasProfile) {
    return null;
  }

  // If profile is required and organization doesn't have a profile, don't render children
  if (requireProfile && user?.role === "ORGANIZATION" && !hasProfile) {
    return null;
  }

  return <>{children}</>;
}
