import {
  ProPlayer,
  ProPlayerApplication,
  CreateProPlayerRequest,
  UpdateProPlayerRequest,
  ProPlayersResponse,
  ApplicationsResponse,
  ProPlayerStats,
} from "../types/proPlayer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

class ProPlayerApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("token");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(
      `${API_BASE_URL}/pro-players${endpoint}`,
      config
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Public endpoints
  async getProPlayers(params?: {
    game?: string;
    page?: number;
    limit?: number;
  }): Promise<ProPlayersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.game) searchParams.append("game", params.game);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request<ProPlayersResponse>(query ? `?${query}` : "");
  }

  async getProPlayer(id: string): Promise<ProPlayer> {
    return this.request<ProPlayer>(`/${id}`);
  }

  // Authenticated user endpoints
  async createProPlayer(data: CreateProPlayerRequest): Promise<ProPlayer> {
    return this.request<ProPlayer>("", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProPlayer(
    id: string,
    data: UpdateProPlayerRequest
  ): Promise<ProPlayer> {
    return this.request<ProPlayer>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProPlayer(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}`, {
      method: "DELETE",
    });
  }

  // Admin endpoints
  async getApplications(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.request<ApplicationsResponse>(
      `/admin/applications${query ? `?${query}` : ""}`
    );
  }

  async updateApplicationStatus(
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<ProPlayerApplication> {
    return this.request<ProPlayerApplication>(`/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  async getStats(): Promise<ProPlayerStats> {
    return this.request<ProPlayerStats>("/admin/stats");
  }
}

export const proPlayerApi = new ProPlayerApi();
export default proPlayerApi;
