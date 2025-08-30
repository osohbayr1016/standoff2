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
      return response.data.data || [];
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
      return response.data.data || [];
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
        return "https://res.cloudinary.com/djvjsyzgw/image/upload/v1756565086/Gemini_Generated_Image_ot4tb8ot4tb8ot4t_o5gyru.png"; // Diamond division coin
      default:
        return "https://res.cloudinary.com/djvjsyzgw/image/upload/v1756557908/coin_masl_nzwekq.png"; // Default fallback to gold
    }
  }

  /**
   * Get division emoji for display
   */
  static getDivisionEmoji(division: SquadDivision): string {
    switch (division) {
      case SquadDivision.SILVER:
        return "🥈";
      case SquadDivision.GOLD:
        return "🥇";
      case SquadDivision.DIAMOND:
        return "💎";
      default:
        return "🏆";
    }
  }

  /**
   * Get division description
   */
  static getDivisionDescription(division: SquadDivision): string {
    switch (division) {
      case SquadDivision.SILVER:
        return "Silver Division - Starting point for new squads";
      case SquadDivision.GOLD:
        return "Gold Division - Intermediate level squads";
      case SquadDivision.DIAMOND:
        return "Diamond Division - Elite level squads";
      default:
        return "Unknown Division";
    }
  }

  /**
   * Check if a squad can upgrade to next division
   */
  static canUpgradeToNextDivision(
    currentDivision: SquadDivision,
    currentBountyCoins: number
  ): boolean {
    const upgradeCost = this.getUpgradeCost(currentDivision);
    if (upgradeCost === null) return false;
    return currentBountyCoins >= upgradeCost;
  }

  /**
   * Get next division
   */
  static getNextDivision(currentDivision: SquadDivision): SquadDivision | null {
    switch (currentDivision) {
      case SquadDivision.SILVER:
        return SquadDivision.GOLD;
      case SquadDivision.GOLD:
        return SquadDivision.DIAMOND;
      case SquadDivision.DIAMOND:
        return null; // Already at highest division
      default:
        return null;
    }
  }

  /**
   * Get previous division
   */
  static getPreviousDivision(
    currentDivision: SquadDivision
  ): SquadDivision | null {
    switch (currentDivision) {
      case SquadDivision.SILVER:
        return null; // Already at lowest division
      case SquadDivision.GOLD:
        return SquadDivision.SILVER;
      case SquadDivision.DIAMOND:
        return SquadDivision.GOLD;
      default:
        return null;
    }
  }

  /**
   * Calculate progress percentage to next division
   */
  static calculateProgressToNextDivision(
    currentDivision: SquadDivision,
    currentBountyCoins: number
  ): number {
    const upgradeCost = this.getUpgradeCost(currentDivision);
    if (upgradeCost === null) return 100; // Already at highest division

    const progress = (currentBountyCoins / upgradeCost) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0-100
  }
}
