// API Utility functions for robust production deployment

interface ApiCallOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Robust API call with timeout, retries, and error handling
 */
export const robustApiCall = async (
  url: string,
  options: RequestInit = {},
  config: ApiCallOptions = {}
): Promise<Response> => {
  const { timeout = 15000, retries = 2, retryDelay = 1000 } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If we get a response (even if it's an error), return it
      // Don't retry on 4xx errors (client errors)
      if (response.status < 500) {
        return response;
      }

      // For 5xx errors, retry if we have attempts left
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === "AbortError") {
      } else {
      }

      // If this is our last attempt, throw the error
      if (attempt >= retries) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error("API call failed after all retries");
};

/**
 * Check if backend is healthy
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await robustApiCall(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`,
      {},
      { timeout: 5000, retries: 1 }
    );
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

/**
 * Enhanced fetch with automatic fallback to demo data
 */
export const fetchWithFallback = async <T>(
  url: string,
  fallbackData: T,
  options: RequestInit = {},
  config: ApiCallOptions = {}
): Promise<{ data: T; isFromApi: boolean }> => {
  try {
    const response = await robustApiCall(url, options, config);

    if (response.ok) {
      const data = await response.json();
      return { data: data.success ? data : fallbackData, isFromApi: true };
    } else {
      return { data: fallbackData, isFromApi: false };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { data: fallbackData, isFromApi: false };
  }
};

/**
 * Get API base URL with fallback
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // In browser
    if (window.location.hostname === "localhost") {
      return "http://localhost:8000";
    } else {
      return (
        process.env.NEXT_PUBLIC_API_URL ||
        "https://e-sport-connection-0596.onrender.com"
      );
    }
  } else {
    // On server
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
};

/**
 * Check if we're in production
 */
export const isProduction = (): boolean => {
  return (
    process.env.NODE_ENV === "production" ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost")
  );
};

/**
 * Log API errors in development, silent in production
 */
export const logApiError = (message: string, error?: any): void => {
  if (!isProduction()) {
    console.error(message, error);
  }
};
