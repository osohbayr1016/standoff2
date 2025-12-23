"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Achievement_1 = __importDefault(require("../models/Achievement"));
const Badge_1 = __importDefault(require("../models/Badge"));
const UserAchievement_1 = __importDefault(require("../models/UserAchievement"));
const UserBadge_1 = __importDefault(require("../models/UserBadge"));
const achievementService_1 = require("../services/achievementService");
async function testAchievementSystem() {
    try {
        console.log("🧪 Testing Achievement System...");
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        const achievements = await Achievement_1.default.find({});
        console.log(`📊 Found ${achievements.length} achievements`);
        const badges = await Badge_1.default.find({});
        console.log(`🏅 Found ${badges.length} badges`);
        const testUserId = new mongoose_1.default.Types.ObjectId();
        console.log("🎯 Testing achievement trigger...");
        await achievementService_1.AchievementService.processAchievementTrigger({
            userId: testUserId,
            type: "profile_update",
            data: {
                game: "Mobile Legends: Bang Bang",
                rank: "Epic",
                category: "Mobile",
            },
        });
        const userAchievements = await UserAchievement_1.default.find({ userId: testUserId });
        console.log(`✅ Created ${userAchievements.length} user achievements`);
        const userBadges = await UserBadge_1.default.find({ userId: testUserId });
        console.log(`🏆 Created ${userBadges.length} user badges`);
        console.log("🎉 Achievement system test completed successfully!");
    }
    catch (error) {
        console.error("❌ Error testing achievement system:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}
if (require.main === module) {
    testAchievementSystem();
}
exports.default = testAchievementSystem;
