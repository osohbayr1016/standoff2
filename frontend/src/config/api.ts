// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

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
  },
  CLANS: {
    ALL: `${API_BASE_URL}/api/clans`,
    GET: (id: string) => `${API_BASE_URL}/api/clans/${id}`,
    CREATE: `${API_BASE_URL}/api/clans`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/clans/${id}`,
    INVITE: (id: string) => `${API_BASE_URL}/api/clans/${id}/invite`,
    ACCEPT: (id: string) => `${API_BASE_URL}/api/clans/${id}/accept`,
    DECLINE: (id: string) => `${API_BASE_URL}/api/clans/${id}/decline`,
    LEAVE: (id: string) => `${API_BASE_URL}/api/clans/${id}/leave`,
    REMOVE_MEMBER: (id: string, memberId: string) =>
      `${API_BASE_URL}/api/clans/${id}/members/${memberId}`,
    USER_CLAN: `${API_BASE_URL}/api/clans/user/me`,
    USER_INVITATIONS: `${API_BASE_URL}/api/clans/user/invitations`,
  },
  HEALTH: `${API_BASE_URL}/health`,
};

export { API_BASE_URL, WS_BASE_URL };
