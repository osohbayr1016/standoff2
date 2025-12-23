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
const mongoose_1 = __importStar(require("mongoose"));
const Squad_1 = require("./Squad");
const tournamentMatchSchema = new mongoose_1.Schema({
    tournament: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
    },
    matchNumber: {
        type: Number,
        required: true,
    },
    round: {
        type: Number,
        required: true,
        min: 1,
    },
    squad1: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
    },
    squad2: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
    },
    winner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
    },
    loser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
    },
    status: {
        type: String,
        enum: ["scheduled", "in_progress", "completed", "cancelled"],
        default: "scheduled",
    },
    scheduledTime: {
        type: Date,
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    score: {
        squad1Score: {
            type: Number,
            min: 0,
        },
        squad2Score: {
            type: Number,
            min: 0,
        },
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    isWalkover: {
        type: Boolean,
        default: false,
    },
    walkoverReason: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    bountyCoinsDistributed: {
        type: Boolean,
        default: false,
    },
    bountyCoinAmount: {
        type: Number,
        default: 50,
    },
    matchType: {
        type: String,
        enum: ["normal", "auto_win", "walkover"],
        default: "normal",
    },
    applyLoserDeduction: {
        type: Boolean,
        default: true,
    },
    squad1Division: {
        type: String,
        enum: Object.values(Squad_1.SquadDivision),
    },
    squad2Division: {
        type: String,
        enum: Object.values(Squad_1.SquadDivision),
    },
    squad1BountyChange: {
        type: Number,
        default: 0,
    },
    squad2BountyChange: {
        type: Number,
        default: 0,
    },
    divisionChangesProcessed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
tournamentMatchSchema.index({ tournament: 1, round: 1 });
tournamentMatchSchema.index({ tournament: 1, matchNumber: 1 }, { unique: true });
tournamentMatchSchema.index({ tournament: 1, status: 1 });
tournamentMatchSchema.index({ squad1: 1 });
tournamentMatchSchema.index({ squad2: 1 });
tournamentMatchSchema.index({ scheduledTime: 1 });
tournamentMatchSchema.index({ bountyCoinsDistributed: 1 });
tournamentMatchSchema.index({ divisionChangesProcessed: 1 });
tournamentMatchSchema.pre("save", function (next) {
    if (this.squad1.toString() === this.squad2.toString()) {
        return next(new Error("Squad1 and Squad2 cannot be the same"));
    }
    next();
});
exports.default = mongoose_1.default.model("TournamentMatch", tournamentMatchSchema);
