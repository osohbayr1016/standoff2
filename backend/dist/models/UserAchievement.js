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
exports.UserAchievementStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserAchievementStatus;
(function (UserAchievementStatus) {
    UserAchievementStatus["IN_PROGRESS"] = "IN_PROGRESS";
    UserAchievementStatus["COMPLETED"] = "COMPLETED";
    UserAchievementStatus["CLAIMED"] = "CLAIMED";
})(UserAchievementStatus || (exports.UserAchievementStatus = UserAchievementStatus = {}));
const userAchievementSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    achievementId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Achievement",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(UserAchievementStatus),
        default: UserAchievementStatus.IN_PROGRESS,
    },
    progress: {
        current: {
            type: Number,
            default: 0,
            min: 0,
        },
        target: {
            type: Number,
            required: true,
            min: 1,
        },
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    completedAt: {
        type: Date,
    },
    claimedAt: {
        type: Date,
    },
    rewardsClaimed: {
        bountyCoins: {
            type: Boolean,
            default: false,
        },
        experience: {
            type: Boolean,
            default: false,
        },
        badge: {
            type: Boolean,
            default: false,
        },
        title: {
            type: Boolean,
            default: false,
        },
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, status: 1 });
userAchievementSchema.index({ achievementId: 1 });
userAchievementSchema.index({ completedAt: 1 });
userAchievementSchema.index({ "progress.percentage": 1 });
exports.default = mongoose_1.default.model("UserAchievement", userAchievementSchema);
