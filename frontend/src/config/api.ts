// API Configuration with production fallback handling
const getApiBaseUrl = () => {
  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback logic based on environment
  if (typeof window !== "undefined") {
    // In browser
    if (window.location.hostname === "localhost") {
      return "http://localhost:8000";
    } else {
      // Production - use Render backend
      return "https://e-sport-connection-0596.onrender.com";
    }
  } else {
    // On server (SSR)
    return process.env.NODE_ENV === "production"
      ? "https://e-sport-connection-0596.onrender.com"
      : "http://localhost:8000";
  }
};

const API_BASE_URL = getApiBaseUrl();

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://e-sport-connection-0596.onrender.com"
    : "http://localhost:8000");

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    FACEBOOK: `${API_BASE_URL}/api/auth/facebook`,
  },
  USERS: {
    PLAYERS: `${API_BASE_URL}/api/users/players`,
    PROFILE: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
  },
  PLAYER_PROFILES: {
    ALL: `${API_BASE_URL}/api/player-profiles/profiles`,
    GET: (id: string) => `${API_BASE_URL}/api/player-profiles/profiles/${id}`,
    MY_PROFILE: `${API_BASE_URL}/api/player-profiles/my-profile`,
    CREATE: `${API_BASE_URL}/api/player-profiles/create-profile`,
    UPDATE: `${API_BASE_URL}/api/player-profiles/update-profile`,
    HAS_PROFILE: `${API_BASE_URL}/api/player-profiles/has-profile`,
  },
  NEWS: {
    ALL: `${API_BASE_URL}/api/news`,
    GET: (id: string) => `${API_BASE_URL}/api/news/${id}`,
    FEATURED: `${API_BASE_URL}/api/news/featured`,
    CATEGORIES: `${API_BASE_URL}/api/news/categories/list`,
    TYPES: `${API_BASE_URL}/api/news/types/list`,
  },
  TOURNAMENTS: {
    ALL: `${API_BASE_URL}/api/tournaments`,
    GET: (id: string) => `${API_BASE_URL}/api/tournaments/${id}`,
    CREATE: `${API_BASE_URL}/api/tournaments`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/tournaments/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/tournaments/${id}`,
    START: (id: string) => `${API_BASE_URL}/api/tournaments/${id}/start`,
    GAMES: `${API_BASE_URL}/api/tournaments/games/list`,
    ORGANIZERS: `${API_BASE_URL}/api/tournaments/organizers/list`,
    REGISTER: (id: string) => `${API_BASE_URL}/api/tournaments/${id}/register`,
    UNREGISTER: (id: string) =>
      `${API_BASE_URL}/api/tournaments/${id}/unregister`,
  },
  TOURNAMENT_REGISTRATIONS: {
    ALL: `${API_BASE_URL}/api/tournament-registrations`,
    GET: (id: string) => `${API_BASE_URL}/api/tournament-registrations/${id}`,
    CREATE: `${API_BASE_URL}/api/tournament-registrations/register`,
    PENDING_TAX: `${API_BASE_URL}/api/tournament-registrations/pending-tax`,
    APPROVE: (id: string) =>
      `${API_BASE_URL}/api/tournament-registrations/${id}/approve`,
  },
  DASHBOARD: {
    STATS: `${API_BASE_URL}/api/dashboard/stats`,
    ACTIVITY: `${API_BASE_URL}/api/dashboard/activity`,
  },
  ORGANIZATION_PROFILES: {
    ALL: `${API_BASE_URL}/api/organization-profiles/profiles`,
    GET: (id: string) =>
      `${API_BASE_URL}/api/organization-profiles/profiles/${id}`,
    MY_PROFILE: `${API_BASE_URL}/api/organization-profiles/my-profile`,
    CREATE: `${API_BASE_URL}/api/organization-profiles/create-profile`,
    UPDATE: `${API_BASE_URL}/api/organization-profiles/update-profile`,
    HAS_PROFILE: `${API_BASE_URL}/api/organization-profiles/has-profile`,
  },
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/api/upload/image`,
    DELETE_IMAGE: (publicId: string) =>
      `${API_BASE_URL}/api/upload/image/${publicId}`,
  },
  MESSAGES: {
    LIST: (playerId: string) => `${API_BASE_URL}/api/messages/${playerId}`,
    SEND: `${API_BASE_URL}/api/messages`,
    MARK_READ: `${API_BASE_URL}/api/messages/read`,
    UNREAD_COUNT: `${API_BASE_URL}/api/messages/unread/count`,
  },
  NOTIFICATIONS: {
    ALL: `${API_BASE_URL}/api/notifications`,
    UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread/count`,
    MARK_READ: (notificationId: string) =>
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/api/notifications/read-all`,
    DELETE: (notificationId: string) =>
      `${API_BASE_URL}/api/notifications/${notificationId}`,
  },

  STATS: {
    OVERVIEW: `${API_BASE_URL}/api/stats/overview`,
  },
  BOUNTY_COINS: {
    BALANCE: (userId: string) =>
      `${API_BASE_URL}/api/bounty-coins/balance/${userId}`,
    TRANSACTIONS: (userId: string) =>
      `${API_BASE_URL}/api/bounty-coins/transactions/${userId}`,
    SQUAD_SUMMARY: (squadId: string) =>
      `${API_BASE_URL}/api/bounty-coins/squad/${squadId}`,
    LEADERBOARD: `${API_BASE_URL}/api/bounty-coins/leaderboard`,
    HEALTH: `${API_BASE_URL}/api/bounty-coins/health`,
    WITHDRAW_CREATE: `${API_BASE_URL}/api/bounty-coins/withdraw`,
    WITHDRAW_LIST: (params?: string) =>
      `${API_BASE_URL}/api/bounty-coins/withdraw${params ? `?${params}` : ""}`,
    WITHDRAW_DECIDE: (id: string) =>
      `${API_BASE_URL}/api/bounty-coins/withdraw/${id}/decision`,
    REQUEST_PURCHASE: `${API_BASE_URL}/api/bounty-coins/request-purchase`,
    PURCHASE_LIST: (params?: string) =>
      `${API_BASE_URL}/api/bounty-coins/purchase${params ? `?${params}` : ""}`,
    PURCHASE_DECIDE: (id: string) =>
      `${API_BASE_URL}/api/bounty-coins/purchase/${id}/decision`,
  },
  SQUADS: {
    ALL: `${API_BASE_URL}/api/squads`,
    GET: (id: string) => `${API_BASE_URL}/api/squads/${id}`,
    CREATE: `${API_BASE_URL}/api/squads`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/squads/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/squads/${id}`,
    APPLY: (id: string) => `${API_BASE_URL}/api/squads/${id}/apply`,
    INVITE: (id: string) => `${API_BASE_URL}/api/squads/${id}/invite`,
    JOIN: (id: string) => `${API_BASE_URL}/api/squads/${id}/join`,
    LEAVE: (id: string) => `${API_BASE_URL}/api/squads/${id}/leave`,
    USER_SQUADS: (userId: string) =>
      `${API_BASE_URL}/api/squads/user/${userId}`,
  },
  DIVISIONS: {
    INFO: `${API_BASE_URL}/api/divisions/info`,
    LEADERBOARD: (division: string) =>
      `${API_BASE_URL}/api/divisions/leaderboard/${division}`,
    SQUAD_INFO: (squadId: string) =>
      `${API_BASE_URL}/api/divisions/squad/${squadId}`,
    PURCHASE: (squadId: string) =>
      `${API_BASE_URL}/api/divisions/purchase/${squadId}`,
    UPGRADE: (squadId: string) =>
      `${API_BASE_URL}/api/divisions/upgrade/${squadId}`,
  },

  HEALTH: `${API_BASE_URL}/health`,
};

export { API_BASE_URL, WS_BASE_URL };
