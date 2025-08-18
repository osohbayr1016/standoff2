import PlayerProfile from "../models/PlayerProfile";
import faceitService from "./faceitService";
const cron = require("node-cron");
import * as NodeCron from "node-cron";

class FaceitSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the periodic FACEIT data synchronization
   */
  start() {
    if (!faceitService.isServiceEnabled()) {
      console.log("🔄 FACEIT sync service disabled (no API key configured)");
      return;
    }

    if (this.isRunning) {
      console.log("FACEIT sync service is already running");
      return;
    }

    this.isRunning = true;
    console.log("🔄 Starting FACEIT sync service...");

    // Run every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
      await this.syncAllLinkedPlayers();
    });

    // Also run immediately on startup
    this.syncAllLinkedPlayers();
  }

  /**
   * Stop the synchronization service
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log("⏹️ FACEIT sync service stopped");
  }

  /**
   * Sync all linked FACEIT players
   */
  async syncAllLinkedPlayers() {
    if (!faceitService.isServiceEnabled()) {
      console.log("⚠️ FACEIT sync skipped - service disabled");
      return;
    }

    try {
      console.log("🔄 Starting FACEIT sync for all linked players...");

      const linkedProfiles = await PlayerProfile.find({
        "faceitData.faceitId": { $exists: true },
        "faceitData.isActive": true,
      });

      if (linkedProfiles.length === 0) {
        console.log("No linked FACEIT players found");
        return;
      }

      console.log(`Found ${linkedProfiles.length} linked FACEIT players`);

      const results = {
        updated: 0,
        failed: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const profile of linkedProfiles) {
        try {
          await this.syncPlayerProfile(profile, results);
        } catch (error) {
          results.failed++;
          results.errors.push(
            `${profile.faceitData?.nickname || "Unknown"}: ${error}`
          );
          console.error(
            `Error syncing ${profile.faceitData?.nickname}:`,
            error
          );
        }
      }

      console.log("✅ FACEIT sync completed:", {
        total: linkedProfiles.length,
        updated: results.updated,
        skipped: results.skipped,
        failed: results.failed,
      });

      if (results.errors.length > 0) {
        console.error("Sync errors:", results.errors);
      }
    } catch (error) {
      console.error("Error in FACEIT sync service:", error);
    }
  }

  /**
   * Sync a single player profile
   */
  private async syncPlayerProfile(
    profile: any,
    results: {
      updated: number;
      failed: number;
      skipped: number;
      errors: string[];
    }
  ) {
    if (!profile.faceitData?.faceitId) {
      results.skipped++;
      return;
    }

    // Check if data needs refresh (older than 1 hour)
    const needsRefresh = faceitService.needsRefresh(
      new Date(profile.faceitData.lastUpdated)
    );

    if (!needsRefresh) {
      results.skipped++;
      return;
    }

    // Fetch updated FACEIT data
    const updatedData = await faceitService.refreshPlayerData(
      profile.faceitData.faceitId
    );

    // Check if there are any changes
    const hasChanges = this.hasSignificantChanges(
      profile.faceitData,
      updatedData
    );

    if (!hasChanges) {
      // Update lastUpdated even if no changes to prevent unnecessary API calls
      profile.faceitData.lastUpdated = new Date();
      await profile.save();
      results.skipped++;
      return;
    }

    // Update the profile with new data
    profile.faceitData = {
      ...profile.faceitData,
      ...updatedData,
    };

    // Update rank if FACEIT level changed significantly
    const oldLevel = profile.faceitData.level;
    const newLevel = updatedData.level;

    if (oldLevel !== newLevel) {
      const faceitRankEquivalent = this.getFaceitRankEquivalent(newLevel);
      if (this.shouldUpdateRank(profile.rank, faceitRankEquivalent)) {
        profile.rank = faceitRankEquivalent;
        console.log(
          `Updated rank for ${updatedData.nickname}: ${profile.rank} (FACEIT Level ${newLevel})`
        );
      }
    }

    await profile.save();
    results.updated++;

    console.log(
      `✅ Updated ${updatedData.nickname}: Level ${updatedData.level}, ELO ${updatedData.elo}`
    );
  }

  /**
   * Check if there are significant changes in FACEIT data
   */
  private hasSignificantChanges(oldData: any, newData: any): boolean {
    // Check level change
    if (oldData.level !== newData.level) {
      return true;
    }

    // Check significant ELO change (more than 50 points)
    if (Math.abs(oldData.elo - newData.elo) > 50) {
      return true;
    }

    // Check stats changes (if available)
    if (oldData.gamePlayerStats && newData.gamePlayerStats) {
      const oldStats = oldData.gamePlayerStats;
      const newStats = newData.gamePlayerStats;

      // Check if matches increased (new games played)
      if (newStats.matches > oldStats.matches) {
        return true;
      }

      // Check significant changes in stats
      if (
        Math.abs(oldStats.averageKD - newStats.averageKD) > 0.1 ||
        Math.abs(oldStats.winRate - newStats.winRate) > 5
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get equivalent CS2 rank for FACEIT level
   */
  private getFaceitRankEquivalent(faceitLevel: number): string {
    const rankMap = {
      1: "Silver",
      2: "Silver Elite",
      3: "Gold Nova",
      4: "Gold Nova Master",
      5: "Master Guardian",
      6: "Master Guardian Elite",
      7: "Distinguished Master Guardian",
      8: "Legendary Eagle",
      9: "Legendary Eagle Master",
      10: "Supreme Master First Class",
    };
    return rankMap[faceitLevel as keyof typeof rankMap] || "Silver";
  }

  /**
   * Check if rank should be updated based on FACEIT level
   */
  private shouldUpdateRank(currentRank: string, faceitRank: string): boolean {
    const rankHierarchy = [
      "Silver",
      "Silver Elite",
      "Gold Nova",
      "Gold Nova Master",
      "Master Guardian",
      "Master Guardian Elite",
      "Distinguished Master Guardian",
      "Legendary Eagle",
      "Legendary Eagle Master",
      "Supreme Master First Class",
      "Global Elite",
    ];

    const currentIndex = rankHierarchy.indexOf(currentRank);
    const faceitIndex = rankHierarchy.indexOf(faceitRank);

    // Update if FACEIT rank is higher or current rank is not in hierarchy
    return currentIndex === -1 || faceitIndex > currentIndex;
  }

  /**
   * Manually sync a specific player
   */
  async syncPlayer(userId: string): Promise<boolean> {
    try {
      const profile = await PlayerProfile.findOne({ userId });

      if (!profile || !profile.faceitData?.faceitId) {
        throw new Error("Player profile or FACEIT data not found");
      }

      const updatedData = await faceitService.refreshPlayerData(
        profile.faceitData.faceitId
      );

      profile.faceitData = {
        ...profile.faceitData,
        ...updatedData,
      };

      // Update rank if needed
      const faceitRankEquivalent = this.getFaceitRankEquivalent(
        updatedData.level
      );
      if (this.shouldUpdateRank(profile.rank, faceitRankEquivalent)) {
        profile.rank = faceitRankEquivalent;
      }

      await profile.save();
      return true;
    } catch (error) {
      console.error(`Error syncing player ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats() {
    try {
      const totalLinked = await PlayerProfile.countDocuments({
        "faceitData.faceitId": { $exists: true },
        "faceitData.isActive": true,
      });

      const needsRefresh = await PlayerProfile.countDocuments({
        "faceitData.faceitId": { $exists: true },
        "faceitData.isActive": true,
        "faceitData.lastUpdated": {
          $lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
      });

      return {
        totalLinked,
        needsRefresh,
        isRunning: this.isRunning,
      };
    } catch (error) {
      console.error("Error getting sync stats:", error);
      return {
        totalLinked: 0,
        needsRefresh: 0,
        isRunning: this.isRunning,
      };
    }
  }
}

export default new FaceitSyncService();
