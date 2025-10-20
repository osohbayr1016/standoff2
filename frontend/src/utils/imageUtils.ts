// Image utility functions
import type React from "react";
import { API_BASE_URL } from "@/config/api";

export const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop";

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const getImageUrl = (url: string): string => {
  if (!url) return DEFAULT_IMAGE_URL;
  const trimmed = url.trim().replace(/\\+/g, "/");

  // Absolute http/https
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Protocol-relative URLs (e.g., //images.example.com/x.png)
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Data URLs
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If it already accidentally contains the API base twice, de-dupe
  if (trimmed.startsWith(API_BASE_URL)) {
    return trimmed;
  }

  // Relative paths from backend (e.g., /uploads/.. or uploads/..)
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${path}`.replace(/([^:]\/)\/+/, "$1/");
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  const target = e.target as HTMLImageElement;
  target.src = DEFAULT_IMAGE_URL;
};
