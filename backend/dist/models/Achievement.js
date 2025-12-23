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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementType = exports.AchievementRarity = exports.AchievementCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["TOURNAMENT"] = "TOURNAMENT";
    AchievementCategory["MATCH"] = "MATCH";
    AchievementCategory["SOCIAL"] = "SOCIAL";
    AchievementCategory["PROGRESS"] = "PROGRESS";
    AchievementCategory["SPECIAL"] = "SPECIAL";
    AchievementCategory["SEASONAL"] = "SEASONAL";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
var AchievementRarity;
(function (AchievementRarity) {
    AchievementRarity["COMMON"] = "COMMON";
    AchievementRarity["RARE"] = "RARE";
    AchievementRarity["EPIC"] = "EPIC";
    AchievementRarity["LEGENDARY"] = "LEGENDARY";
})(AchievementRarity || (exports.AchievementRarity = AchievementRarity = {}));
var AchievementType;
(function (AchievementType) {
    AchievementType["COUNTER"] = "COUNTER";
    AchievementType["MILESTONE"] = "MILESTONE";
    AchievementType["CONDITIONAL"] = "CONDITIONAL";
    AchievementType["TIME_BASED"] = "TIME_BASED";
})(AchievementType || (exports.AchievementType = AchievementType = {}));
const achievementSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    category: {
        type: String,
        enum: Object.values(AchievementCategory),
        required: true,
    },
    rarity: {
        type: String,
        enum: Object.values(AchievementRarity),
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(AchievementType),
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
        min: 1,
    },
    requirements: {
        counter: {
            type: Number,
            min: 1,
        },
        condition: {
            type: String,
            trim: true,
        },
        milestone: {
            type: String,
            trim: true,
        },
        timeFrame: {
            type: Number,
            min: 1,
        },
        game: {
            type: String,
            trim: true,
        },
        rank: {
            type: String,
            trim: true,
        },
    },
    rewards: {
        bountyCoins: {
            type: Number,
            min: 0,
        },
        experience: {
            type: Number,
            min: 0,
        },
        badge: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Badge",
        },
        title: {
            type: String,
            trim: true,
            maxlength: 50,
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isSeasonal: {
        type: Boolean,
        default: false,
    },
    seasonStart: {
        type: Date,
    },
    seasonEnd: {
        type: Date,
    },
    prerequisites: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Achievement",
        }],
}, {
    timestamps: true,
});
achievementSchema.index({ category: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ isSeasonal: 1 });
exports.default = mongoose_1.default.model("Achievement", achievementSchema);
