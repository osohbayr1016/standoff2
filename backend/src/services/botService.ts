import mongoose from "mongoose";
import User, { UserRole } from "../models/User";
import PlayerProfile from "../models/PlayerProfile";
import MatchmakingQueue from "../models/MatchmakingQueue";

export class BotService {
  /**
   * Create a bot user and player profile
   */
  static async createBotProfile(botNumber: number): Promise<string> {
    try {
      const botEmail = `bot${botNumber}@test.local`;
      const botInGameName = `Bot #${botNumber}`;
      const botStandoff2Id = `BOT${String(botNumber).padStart(3, "0")}`;
      
      // Random ELO between 800-1200
      const botElo = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;

      // Check if bot user already exists
      let user = await User.findOne({ email: botEmail });
      
      if (!user) {
        // Create bot user with a proper ObjectId
        user = await User.create({
          email: botEmail,
          name: botInGameName,
          role: UserRole.USER,
          isVerified: true,
          isOnline: false,
          rating: 0,
          totalReviews: 0,
        });
      }

      // Check if player profile exists
      let profile = await PlayerProfile.findOne({ userId: user._id });
      
      if (!profile) {
        // Create bot player profile
        profile = await PlayerProfile.create({
          userId: user._id,
          category: "PC",
          game: "Standoff 2",
          roles: ["Entry Fragger"],
          inGameName: botInGameName,
          standoff2Id: botStandoff2Id,
          rank: "Silver",
          elo: botElo,
          isLookingForTeam: false,
          achievements: [],
          availability: {
            weekdays: true,
            weekends: true,
            timezone: "UTC",
            preferredHours: "Anytime",
          },
          languages: ["English"],
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          totalMatches: 0,
          isOnline: false,
          socialLinks: {},
          friends: [],
          uniqueId: `bot${botNumber}`,
        });
      }

      return user._id.toString();
    } catch (error: any) {
      console.error(`Error creating bot profile ${botNumber}:`, error);
      throw new Error(`Failed to create bot profile: ${error.message}`);
    }
  }

  /**
   * Ensure N bot profiles exist
   */
  static async ensureBotProfiles(count: number): Promise<string[]> {
    try {
      const botUserIds: string[] = [];
      
      for (let i = 1; i <= count; i++) {
        const userId = await this.createBotProfile(i);
        botUserIds.push(userId);
      }

      return botUserIds;
    } catch (error: any) {
      console.error("Error ensuring bot profiles:", error);
      throw new Error(`Failed to ensure bot profiles: ${error.message}`);
    }
  }

  /**
   * Get bot user IDs (creates them if they don't exist)
   */
  static async getBotUserIds(count: number): Promise<string[]> {
    try {
      const botUserIds = await this.ensureBotProfiles(count);
      return botUserIds;
    } catch (error: any) {
      console.error("Error getting bot user IDs:", error);
      throw new Error(`Failed to get bot user IDs: ${error.message}`);
    }
  }

  /**
   * Remove a bot from the queue
   */
  static async removeBotFromQueue(userId: string): Promise<boolean> {
    try {
      const result = await MatchmakingQueue.deleteOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error removing bot from queue:", error);
      return false;
    }
  }

  /**
   * Remove all bots from the queue
   */
  static async clearBotsFromQueue(): Promise<number> {
    try {
      // Find all bot users by email pattern
      const botUsers = await User.find({ 
        email: { $regex: /^bot\d+@test\.local$/ } 
      }).select('_id').lean();
      
      const botUserIdStrings = botUsers.map(u => u._id.toString());
      
      if (botUserIdStrings.length === 0) {
        return 0;
      }
      
      // Remove all queue entries that contain bot users
      const queueEntries = await MatchmakingQueue.find().lean();
      
      let removedCount = 0;
      for (const entry of queueEntries) {
        // Check if any party member is a bot
        const hasBots = entry.partyMembers.some(memberId => 
          botUserIdStrings.includes(memberId.toString())
        );
        
        if (hasBots) {
          await MatchmakingQueue.deleteOne({ _id: entry._id });
          removedCount += entry.partySize;
        }
      }
      
      console.log(`🧹 Cleared ${removedCount} bots from queue`);
      return removedCount;
    } catch (error) {
      console.error("Error clearing bots from queue:", error);
      return 0;
    }
  }

  /**
   * Check if a user ID is a bot
   */
  static async isBot(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('email').lean();
      return user ? /^bot\d+@test\.local$/.test(user.email) : false;
    } catch (error) {
      return false;
    }
  }
}

