import { API_ENDPOINTS } from "../config/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = "http://localhost:5001";
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          return true;
        }
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return false;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      // If token is expired, try to refresh
      if (response.status === 401 && data.message?.includes("token")) {
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          // Retry the request with new token
          const newHeaders = this.getAuthHeaders();
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.AUTH.ME);
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    });
  }

  async refreshToken(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
    });
  }

  // User methods
  async getPlayers(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.USERS.PLAYERS);
  }

  async getUserProfile(id: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.USERS.PROFILE(id));
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Message methods
  async getMessages(playerId: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.MESSAGES.LIST(playerId));
  }

  async sendMessage(receiverId: string, content: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.MESSAGES.SEND, {
      method: "POST",
      body: JSON.stringify({ receiverId, content }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.HEALTH);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
