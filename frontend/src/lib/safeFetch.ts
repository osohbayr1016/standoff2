export interface SafeFetchOptions extends RequestInit {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const {
    retries = 0,
    retryDelayMs = 300,
    timeoutMs = 8000,
    ...fetchOptions
  } = options;

  let attempt = 0;

  // Normalize method
  const method = (fetchOptions.method || "GET").toUpperCase();
  const isIdempotent = method === "GET" || method === "HEAD";

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Only retry on network/timeout errors for idempotent requests
      const canRetry = isIdempotent && attempt < retries;
      if (!canRetry) {
        throw error;
      }

      attempt += 1;
      await sleep(retryDelayMs);
    }
  }
}

export async function parseJsonSafe(response: Response): Promise<any | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    return await response.json();
  } catch (_e) {
    return null;
  }
}
