// Optional axios import - only used if FACEIT_API_KEY is configured
let axios: any = null;
let AxiosResponse: any = null;

try {
  axios = require("axios");
  AxiosResponse = require("axios").AxiosResponse;
} catch (error) {
  console.log("⚠️  Axios not available - FACEIT features will be disabled");
}

const FACEIT_BASE_URL = "https://open.faceit.com/data/v4";
const FACEIT_API_KEY = process.env.FACEIT_API_KEY;

// FACEIT Player interfaces
interface FaceitPlayer {
  player_id: string;
  nickname: string;
  status: string;
  avatar: string;
  country: string;
  cover_image: string;
  platforms: {
    steam: string;
  };
  games: {
    [key: string]: {
      region: string;
      game_player_id: string;
      skill_level: number;
      faceit_elo: number;
      game_player_name: string;
      skill_level_label: string;
      regions: any;
      game_profile_id: string;
    };
  };
  settings: any;
  bans: any[];
  new_steam_id: string;
  steam_id_64: string;
  steam_nickname: string;
  memberships: string[];
  faceit_url: string;
  membership_type: string;
  cover_featured_image: string;
  infractions: any;
}

interface FaceitPlayerStats {
  player_id: string;
  game_id: string;
  lifetime: {
    "Average K/D Ratio": string;
    "Average K/R Ratio": string;
    "Average Headshots %": string;
    "Win Rate %": string;
    Matches: string;
    "Total Headshots %": string;
    "K/D Ratio": string;
    "K/R Ratio": string;
    Wins: string;
    "Current Win Streak": string;
    "Longest Win Streak": string;
    "Recent Results": string[];
  };
  segments: any[];
}

interface FaceitError {
  errors: Array<{
    message: string;
    code: string;
  }>;
}

class FaceitService {
  private apiKey: string | null;
  private baseURL: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = FACEIT_API_KEY || null;
    this.baseURL = FACEIT_BASE_URL;
    this.isEnabled = !!FACEIT_API_KEY && !!axios;

    if (!this.isEnabled) {
      if (!FACEIT_API_KEY) {
        console.warn(
          "⚠️  FACEIT_API_KEY is not configured. FACEIT features will be disabled."
        );
      }
      if (!axios) {
        console.warn(
          "⚠️  Axios is not available. FACEIT features will be disabled."
        );
      }
    } else {
      console.log("✅ FACEIT API integration enabled");
    }
  }

  private checkEnabled() {
    if (!this.isEnabled || !this.apiKey) {
      throw new Error(
        "FACEIT integration is disabled. Please configure FACEIT_API_KEY in environment variables."
      );
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    this.checkEnabled();

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const faceitError = error.response.data as FaceitError;
          throw new Error(
            `FACEIT API Error: ${
              faceitError.errors?.[0]?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          throw new Error("FACEIT API is not responding");
        }
      }
      throw new Error(`FACEIT Service Error: ${error}`);
    }
  }

  /**
   * Check if FACEIT integration is enabled
   */
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get player by nickname
   */
  async getPlayerByNickname(nickname: string): Promise<FaceitPlayer> {
    const endpoint = `/players?nickname=${encodeURIComponent(nickname)}`;
    return this.makeRequest<FaceitPlayer>(endpoint);
  }

  /**
   * Get player by FACEIT ID
   */
  async getPlayerById(playerId: string): Promise<FaceitPlayer> {
    const endpoint = `/players/${playerId}`;
    return this.makeRequest<FaceitPlayer>(endpoint);
  }

  /**
   * Get player stats for CS2
   */
  async getPlayerStatsCS2(playerId: string): Promise<FaceitPlayerStats> {
    const endpoint = `/players/${playerId}/stats/cs2`;
    return this.makeRequest<FaceitPlayerStats>(endpoint);
  }

  /**
   * Check if player exists by nickname
   */
  async checkPlayerExists(nickname: string): Promise<boolean> {
    try {
      await this.getPlayerByNickname(nickname);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get formatted player data for our database
   */
  async getFormattedPlayerData(nickname: string) {
    try {
      const player = await this.getPlayerByNickname(nickname);

      // Check if player has CS2 game data
      if (!player.games.cs2) {
        throw new Error("Player does not have CS2 data on FACEIT");
      }

      const cs2Data = player.games.cs2;
      let stats = null;

      try {
        const playerStats = await this.getPlayerStatsCS2(player.player_id);
        stats = {
          averageKD: parseFloat(playerStats.lifetime["Average K/D Ratio"]) || 0,
          averageKR: parseFloat(playerStats.lifetime["Average K/R Ratio"]) || 0,
          averageHeadshots:
            parseFloat(playerStats.lifetime["Average Headshots %"]) || 0,
          winRate: parseFloat(playerStats.lifetime["Win Rate %"]) || 0,
          matches: parseInt(playerStats.lifetime.Matches) || 0,
        };
      } catch (statsError) {
        console.warn(
          `Could not fetch stats for player ${nickname}:`,
          statsError
        );
      }

      return {
        faceitId: player.player_id,
        nickname: player.nickname,
        avatar: player.avatar,
        country: player.country,
        level: cs2Data.skill_level,
        elo: cs2Data.faceit_elo,
        gamePlayerStats: stats,
        lastUpdated: new Date(),
        isActive: true,
      };
    } catch (error) {
      throw new Error(`Failed to fetch FACEIT data for ${nickname}: ${error}`);
    }
  }

  /**
   * Refresh player data (for real-time updates)
   */
  async refreshPlayerData(faceitId: string) {
    try {
      const player = await this.getPlayerById(faceitId);

      if (!player.games.cs2) {
        throw new Error("Player no longer has CS2 data on FACEIT");
      }

      const cs2Data = player.games.cs2;
      let stats = null;

      try {
        const playerStats = await this.getPlayerStatsCS2(player.player_id);
        stats = {
          averageKD: parseFloat(playerStats.lifetime["Average K/D Ratio"]) || 0,
          averageKR: parseFloat(playerStats.lifetime["Average K/R Ratio"]) || 0,
          averageHeadshots:
            parseFloat(playerStats.lifetime["Average Headshots %"]) || 0,
          winRate: parseFloat(playerStats.lifetime["Win Rate %"]) || 0,
          matches: parseInt(playerStats.lifetime.Matches) || 0,
        };
      } catch (statsError) {
        console.warn(
          `Could not fetch stats for player ${faceitId}:`,
          statsError
        );
      }

      return {
        faceitId: player.player_id,
        nickname: player.nickname,
        avatar: player.avatar,
        country: player.country,
        level: cs2Data.skill_level,
        elo: cs2Data.faceit_elo,
        gamePlayerStats: stats,
        lastUpdated: new Date(),
        isActive: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to refresh FACEIT data for ${faceitId}: ${error}`
      );
    }
  }

  /**
   * Get ELO level label
   */
  getEloLevelLabel(level: number): string {
    const levelLabels = {
      1: "Level 1",
      2: "Level 2",
      3: "Level 3",
      4: "Level 4",
      5: "Level 5",
      6: "Level 6",
      7: "Level 7",
      8: "Level 8",
      9: "Level 9",
      10: "Level 10",
    };
    return levelLabels[level as keyof typeof levelLabels] || "Unknown";
  }

  /**
   * Get ELO color based on level
   */
  getEloColor(level: number): string {
    const colors = {
      1: "#9e9e9e", // Gray
      2: "#4caf50", // Green
      3: "#8bc34a", // Light Green
      4: "#cddc39", // Lime
      5: "#ffeb3b", // Yellow
      6: "#ffc107", // Amber
      7: "#ff9800", // Orange
      8: "#ff5722", // Deep Orange
      9: "#e91e63", // Pink
      10: "#9c27b0", // Purple
    };
    return colors[level as keyof typeof colors] || "#9e9e9e";
  }

  /**
   * Check if ELO data needs refresh (older than 1 hour)
   */
  needsRefresh(lastUpdated: Date): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastUpdated < oneHourAgo;
  }
}

export default new FaceitService();
