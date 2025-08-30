import {
  SquadDivision,
  DivisionConfig,
  SquadDivisionInfo,
  DivisionLeaderboardEntry,
} from "../types/division";
import apiClient from "./apiClient";

export class DivisionService {
  private static readonly BASE_URL = "/api/divisions";

  /**
   * Get all divisions information
   */
  static async getDivisionsInfo(): Promise<DivisionConfig[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/info`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching divisions info:", error);
      throw error;
    }
  }

  /**
   * Get division leaderboard
   */
  static async getDivisionLeaderboard(
    division: SquadDivision,
    limit: number = 50
  ): Promise<DivisionLeaderboardEntry[]> {
    try {
      const response = await apiClient.get(
        `${this.BASE_URL}/leaderboard/${division}`,
        {
          params: { limit },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching division leaderboard:", error);
      throw error;
    }
  }

  /**
   * Get squad division information
   */
  static async getSquadDivisionInfo(
    squadId: string
  ): Promise<SquadDivisionInfo> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/squad/${squadId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching squad division info:", error);
      throw error;
    }
  }

  /**
   * Use protection for a squad
   */
  static async useProtection(
    squadId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/protection/${squadId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error using protection:", error);
      throw error;
    }
  }

  /**
   * Purchase bounty coins
   */
  static async purchaseBountyCoins(
    squadId: string,
    amount: number
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/purchase/${squadId}`,
        {
          amount,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error purchasing bounty coins:", error);
      throw error;
    }
  }

  /**
   * Process match result (admin only)
   */
  static async processMatchResult(
    matchId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(
        `${this.BASE_URL}/process-match/${matchId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error processing match result:", error);
      throw error;
    }
  }

  /**
   * Get division display name
   */
  static getDivisionDisplayName(division: SquadDivision): string {
    switch (division) {
      case SquadDivision.SILVER:
        return "Silver Division";
      case SquadDivision.GOLD:
        return "Gold Division";
      case SquadDivision.DIAMOND:
        return "Diamond Division";
      default:
        return "Unknown Division";
    }
  }

  /**
   * Get division color
   */
  static getDivisionColor(division: SquadDivision): string {
    switch (division) {
      case SquadDivision.SILVER:
        return "#C0C0C0";
      case SquadDivision.GOLD:
        return "#FFD700";
      case SquadDivision.DIAMOND:
        return "#B9F2FF";
      default:
        return "#6B7280";
    }
  }

  /**
   * Get division requirements text
   */
  static getDivisionRequirements(division: SquadDivision): string {
    switch (division) {
      case SquadDivision.SILVER:
        return "0-250 Bounty Coins";
      case SquadDivision.GOLD:
        return "0-750 Bounty Coins";
      case SquadDivision.DIAMOND:
        return "0+ Bounty Coins";
      default:
        return "Unknown Requirements";
    }
  }

  /**
   * Get upgrade cost for division
   */
  static getUpgradeCost(division: SquadDivision): number | null {
    switch (division) {
      case SquadDivision.SILVER:
        return 250;
      case SquadDivision.GOLD:
        return 750;
      case SquadDivision.DIAMOND:
        return null;
      default:
        return null;
    }
  }

  /**
   * Get bounty coin price for division
   */
  static getBountyCoinPrice(division: SquadDivision): number {
    switch (division) {
      case SquadDivision.SILVER:
        return 10000;
      case SquadDivision.GOLD:
        return 20000;
      case SquadDivision.DIAMOND:
        return 30000;
      default:
        return 10000;
    }
  }

  /**
   * Get division-specific coin image URL
   */
  static getDivisionCoinImage(division: SquadDivision): string {
    switch (division) {
      case SquadDivision.SILVER:
        return "https://res.cloudinary.com/djvjsyzgw/image/upload/v1756565086/Gemini_Generated_Image_rf84kyrf84kyrf84_kf8gkk.png";
      case SquadDivision.GOLD:
        return "https://res.cloudinary.com/djvjsyzgw/image/upload/v1756557908/coin_masl_nzwekq.png"; // Default gold coin
      case SquadDivision.DIAMOND:
        return "https://res.cloudinary.com/djvjsyzgw/image/upload/v1756557908/coin_masl_nzwekq.png"; // Diamond division coin
      default:
        return "https://res.cloudinary.com/djvjsyzgw/image/upload/v1756557908/coin_masl_nzwekq.png"; // Default fallback to gold
    }
  }
}
