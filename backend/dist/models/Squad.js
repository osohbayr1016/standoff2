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
exports.SquadDivision = exports.SquadJoinType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var SquadJoinType;
(function (SquadJoinType) {
    SquadJoinType["INVITE_ONLY"] = "INVITE_ONLY";
    SquadJoinType["OPEN_FOR_APPLY"] = "OPEN_FOR_APPLY";
    SquadJoinType["EVERYONE_CAN_JOIN"] = "EVERYONE_CAN_JOIN";
})(SquadJoinType || (exports.SquadJoinType = SquadJoinType = {}));
var SquadDivision;
(function (SquadDivision) {
    SquadDivision["SILVER"] = "SILVER";
    SquadDivision["GOLD"] = "GOLD";
    SquadDivision["DIAMOND"] = "DIAMOND";
})(SquadDivision || (exports.SquadDivision = SquadDivision = {}));
const squadSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    tag: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10,
        uppercase: true,
    },
    leader: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    maxMembers: {
        type: Number,
        required: true,
        min: 5,
        max: 7,
        default: 7,
    },
    game: {
        type: String,
        required: true,
        trim: true,
        default: "Mobile Legends: Bang Bang",
        enum: ["Mobile Legends: Bang Bang"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    logo: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    joinType: {
        type: String,
        enum: Object.values(SquadJoinType),
        default: SquadJoinType.OPEN_FOR_APPLY,
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 100,
    },
    experience: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalBountyCoinsEarned: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalBountyCoinsSpent: {
        type: Number,
        default: 0,
        min: 0,
    },
    division: {
        type: String,
        enum: Object.values(SquadDivision),
        default: SquadDivision.SILVER,
    },
    currentBountyCoins: {
        type: Number,
        default: 0,
        min: 0,
    },
    protectionCount: {
        type: Number,
        default: 2,
        min: 0,
        max: 2,
    },
    consecutiveLosses: {
        type: Number,
        default: 0,
        min: 0,
    },
    matchStats: {
        wins: {
            type: Number,
            default: 0,
            min: 0,
        },
        losses: {
            type: Number,
            default: 0,
            min: 0,
        },
        draws: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalMatches: {
            type: Number,
            default: 0,
            min: 0,
        },
        winRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalEarned: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});
squadSchema.index({ leader: 1 });
squadSchema.index({ game: 1 });
squadSchema.index({ tag: 1 }, { unique: true });
squadSchema.index({ isActive: 1 });
squadSchema.index({ name: "text", description: "text" });
squadSchema.index({ division: 1 });
squadSchema.index({ currentBountyCoins: 1 });
squadSchema.pre("save", function (next) {
    if (!this.members.includes(this.leader)) {
        this.members.push(this.leader);
    }
    if (this.members.length > this.maxMembers) {
        return next(new Error(`Squad cannot have more than ${this.maxMembers} members`));
    }
    if (!this.matchStats) {
        this.matchStats = {
            wins: 0,
            losses: 0,
            draws: 0,
            totalMatches: 0,
            winRate: 0,
            totalEarned: 0,
        };
    }
    if (this.matchStats && (isNaN(this.matchStats.winRate) || this.matchStats.winRate === null || this.matchStats.winRate === undefined)) {
        const totalMatches = this.matchStats.wins + this.matchStats.losses + this.matchStats.draws;
        if (totalMatches > 0) {
            this.matchStats.winRate = Math.round((this.matchStats.wins / totalMatches) * 100);
        }
        else {
            this.matchStats.winRate = 0;
        }
    }
    next();
});
exports.default = mongoose_1.default.model("Squad", squadSchema);
