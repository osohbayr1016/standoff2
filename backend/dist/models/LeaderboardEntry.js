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
exports.LeaderboardPeriod = exports.LeaderboardType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var LeaderboardType;
(function (LeaderboardType) {
    LeaderboardType["ACHIEVEMENT_POINTS"] = "ACHIEVEMENT_POINTS";
    LeaderboardType["TOURNAMENT_WINS"] = "TOURNAMENT_WINS";
    LeaderboardType["MATCH_WINS"] = "MATCH_WINS";
    LeaderboardType["BOUNTY_COINS"] = "BOUNTY_COINS";
    LeaderboardType["LEVEL"] = "LEVEL";
    LeaderboardType["SEASONAL"] = "SEASONAL";
})(LeaderboardType || (exports.LeaderboardType = LeaderboardType = {}));
var LeaderboardPeriod;
(function (LeaderboardPeriod) {
    LeaderboardPeriod["DAILY"] = "DAILY";
    LeaderboardPeriod["WEEKLY"] = "WEEKLY";
    LeaderboardPeriod["MONTHLY"] = "MONTHLY";
    LeaderboardPeriod["SEASONAL"] = "SEASONAL";
    LeaderboardPeriod["ALL_TIME"] = "ALL_TIME";
})(LeaderboardPeriod || (exports.LeaderboardPeriod = LeaderboardPeriod = {}));
const leaderboardEntrySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    leaderboardType: {
        type: String,
        enum: Object.values(LeaderboardType),
        required: true,
    },
    period: {
        type: String,
        enum: Object.values(LeaderboardPeriod),
        required: true,
    },
    score: {
        type: Number,
        required: true,
        default: 0,
    },
    rank: {
        type: Number,
        required: true,
        min: 1,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, {
    timestamps: true,
});
leaderboardEntrySchema.index({ leaderboardType: 1, period: 1, rank: 1 });
leaderboardEntrySchema.index({ userId: 1, leaderboardType: 1, period: 1 }, { unique: true });
leaderboardEntrySchema.index({ score: -1 });
exports.default = mongoose_1.default.model("LeaderboardEntry", leaderboardEntrySchema);
