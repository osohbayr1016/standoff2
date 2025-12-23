"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
const Achievement_1 = __importDefault(require("../models/Achievement"));
const UserAchievement_1 = __importDefault(require("../models/UserAchievement"));
class AchievementService {
    static async checkAchievements(userId) {
        const achievements = await Achievement_1.default.find({ isActive: true });
        return { success: true, achievements };
    }
    static async unlockAchievement(userId, achievementId) {
        const existing = await UserAchievement_1.default.findOne({ userId, achievementId });
        if (existing)
            return { success: false, message: "Already unlocked" };
        const userAchievement = await UserAchievement_1.default.create({
            userId,
            achievementId,
            unlockedAt: new Date(),
        });
        return { success: true, userAchievement };
    }
    static async getUserAchievements(userId) {
        const achievements = await UserAchievement_1.default.find({ userId })
            .populate("achievementId")
            .sort({ unlockedAt: -1 });
        return { achievements };
    }
    static async triggerAchievement(userId, triggerType, value) {
        return { success: true };
    }
    static async processAchievementTrigger(triggerData) {
        const { userId, type, data } = triggerData;
        const achievements = await Achievement_1.default.find({ isActive: true });
        const unlockedAchievements = [];
        for (const achievement of achievements) {
            const already = await UserAchievement_1.default.findOne({
                userId,
                achievementId: achievement._id,
            });
            if (already)
                continue;
            let shouldUnlock = false;
            if (type === "profile_update" && achievement.requirements?.game) {
                if (data?.game === achievement.requirements.game) {
                    shouldUnlock = true;
                }
            }
            if (type === "match_win" && achievement.requirements?.counter) {
                shouldUnlock = false;
            }
            if (shouldUnlock) {
                const result = await this.unlockAchievement(userId.toString(), achievement._id.toString());
                if (result.success) {
                    unlockedAchievements.push(achievement);
                }
            }
        }
        return { success: true, unlockedAchievements };
    }
}
exports.AchievementService = AchievementService;
exports.default = AchievementService;
