"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importStar(require("../models/User"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
const MatchmakingQueue_1 = __importDefault(require("../models/MatchmakingQueue"));
class BotService {
    static async createBotProfile(botNumber) {
        try {
            const botEmail = `bot${botNumber}@test.local`;
            const botInGameName = `Bot #${botNumber}`;
            const botStandoff2Id = `BOT${String(botNumber).padStart(3, "0")}`;
            const botElo = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
            let user = await User_1.default.findOne({ email: botEmail });
            if (!user) {
                user = await User_1.default.create({
                    email: botEmail,
                    name: botInGameName,
                    role: User_1.UserRole.USER,
                    isVerified: true,
                    isOnline: false,
                    rating: 0,
                    totalReviews: 0,
                });
            }
            let profile = await PlayerProfile_1.default.findOne({ userId: user._id });
            if (!profile) {
                profile = await PlayerProfile_1.default.create({
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
        }
        catch (error) {
            console.error(`Error creating bot profile ${botNumber}:`, error);
            throw new Error(`Failed to create bot profile: ${error.message}`);
        }
    }
    static async ensureBotProfiles(count) {
        try {
            const botUserIds = [];
            for (let i = 1; i <= count; i++) {
                const userId = await this.createBotProfile(i);
                botUserIds.push(userId);
            }
            return botUserIds;
        }
        catch (error) {
            console.error("Error ensuring bot profiles:", error);
            throw new Error(`Failed to ensure bot profiles: ${error.message}`);
        }
    }
    static async getBotUserIds(count) {
        try {
            const botUserIds = await this.ensureBotProfiles(count);
            return botUserIds;
        }
        catch (error) {
            console.error("Error getting bot user IDs:", error);
            throw new Error(`Failed to get bot user IDs: ${error.message}`);
        }
    }
    static async removeBotFromQueue(userId) {
        try {
            const result = await MatchmakingQueue_1.default.deleteOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            });
            return result.deletedCount > 0;
        }
        catch (error) {
            console.error("Error removing bot from queue:", error);
            return false;
        }
    }
    static async clearBotsFromQueue() {
        try {
            const botUsers = await User_1.default.find({
                email: { $regex: /^bot\d+@test\.local$/ }
            }).select('_id').lean();
            const botUserIdStrings = botUsers.map(u => u._id.toString());
            if (botUserIdStrings.length === 0) {
                return 0;
            }
            const queueEntries = await MatchmakingQueue_1.default.find().lean();
            let removedCount = 0;
            for (const entry of queueEntries) {
                const hasBots = entry.partyMembers.some(memberId => botUserIdStrings.includes(memberId.toString()));
                if (hasBots) {
                    await MatchmakingQueue_1.default.deleteOne({ _id: entry._id });
                    removedCount += entry.partySize;
                }
            }
            console.log(`🧹 Cleared ${removedCount} bots from queue`);
            return removedCount;
        }
        catch (error) {
            console.error("Error clearing bots from queue:", error);
            return 0;
        }
    }
    static async isBot(userId) {
        try {
            const user = await User_1.default.findById(userId).select('email').lean();
            return user ? /^bot\d+@test\.local$/.test(user.email) : false;
        }
        catch (error) {
            return false;
        }
    }
}
exports.BotService = BotService;
