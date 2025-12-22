// Achievement Service
import Achievement from "../models/Achievement";
import UserAchievement from "../models/UserAchievement";
import Badge from "../models/Badge";
import UserBadge from "../models/UserBadge";

interface AchievementTriggerData {
  userId: string | any; // Allow ObjectId
  type: string;
  data?: {
    game?: string;
    rank?: string;
    category?: string;
    [key: string]: any;
  };
}

export class AchievementService {
  static async checkAchievements(userId: string) {
    const achievements = await Achievement.find({ isActive: true });
    return { success: true, achievements };
  }

  static async unlockAchievement(userId: string, achievementId: string) {
    const existing = await UserAchievement.findOne({ userId, achievementId });
    if (existing) return { success: false, message: "Already unlocked" };

    const userAchievement = await UserAchievement.create({
      userId,
      achievementId,
      unlockedAt: new Date(),
    });
    return { success: true, userAchievement };
  }

  static async getUserAchievements(userId: string) {
    const achievements = await UserAchievement.find({ userId })
      .populate("achievementId")
      .sort({ unlockedAt: -1 });
    return { achievements };
  }

  static async triggerAchievement(
    userId: string,
    triggerType: string,
    value: number
  ) {
    return { success: true };
  }

  // Process achievement trigger
  static async processAchievementTrigger(triggerData: AchievementTriggerData) {
    const { userId, type, data } = triggerData;

    // Check achievements for this user based on trigger type
    const achievements = await Achievement.find({ isActive: true });
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      const already = await UserAchievement.findOne({
        userId,
        achievementId: achievement._id,
      });

      if (already) continue;

      // Check if achievement matches the trigger type and conditions
      let shouldUnlock = false;

      if (type === "profile_update" && achievement.requirements?.game) {
        if (data?.game === achievement.requirements.game) {
          shouldUnlock = true;
        }
      }

      if (type === "match_win" && achievement.requirements?.counter) {
        // Would need to count user's wins
        shouldUnlock = false;
      }

      if (shouldUnlock) {
        const result = await this.unlockAchievement(
          userId.toString(),
          achievement._id.toString()
        );
        if (result.success) {
          unlockedAchievements.push(achievement);
        }
      }
    }

    return { success: true, unlockedAchievements };
  }
}

export default AchievementService;
