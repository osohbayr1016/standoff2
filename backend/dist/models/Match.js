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
exports.AdminResolution = exports.MatchResult = exports.MatchStatus = exports.MatchType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var MatchType;
(function (MatchType) {
    MatchType["PUBLIC"] = "PUBLIC";
    MatchType["PRIVATE"] = "PRIVATE";
})(MatchType || (exports.MatchType = MatchType = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["PENDING"] = "PENDING";
    MatchStatus["ACCEPTED"] = "ACCEPTED";
    MatchStatus["PLAYING"] = "PLAYING";
    MatchStatus["RESULT_SUBMITTED"] = "RESULT_SUBMITTED";
    MatchStatus["COMPLETED"] = "COMPLETED";
    MatchStatus["DISPUTED"] = "DISPUTED";
    MatchStatus["CANCELLED"] = "CANCELLED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
var MatchResult;
(function (MatchResult) {
    MatchResult["WIN"] = "WIN";
    MatchResult["LOSS"] = "LOSS";
})(MatchResult || (exports.MatchResult = MatchResult = {}));
var AdminResolution;
(function (AdminResolution) {
    AdminResolution["SQUAD_A_WON"] = "SQUAD_A_WON";
    AdminResolution["SQUAD_B_WON"] = "SQUAD_B_WON";
    AdminResolution["DRAW"] = "DRAW";
    AdminResolution["CANCELLED"] = "CANCELLED";
})(AdminResolution || (exports.AdminResolution = AdminResolution = {}));
const matchSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(MatchType),
        required: true,
    },
    challengerSquadId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
        index: true,
    },
    opponentSquadId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        index: true,
    },
    bountyAmount: {
        type: Number,
        required: true,
        min: 1,
    },
    coinsLocked: {
        type: Boolean,
        default: false,
    },
    deadline: {
        type: Date,
        required: true,
    },
    startedAt: {
        type: Date,
    },
    resultDeadline: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: Object.values(MatchStatus),
        default: MatchStatus.PENDING,
        index: true,
    },
    challengerResult: {
        type: String,
        enum: Object.values(MatchResult),
    },
    opponentResult: {
        type: String,
        enum: Object.values(MatchResult),
    },
    challengerReady: {
        type: Boolean,
        default: false,
    },
    opponentReady: {
        type: Boolean,
        default: false,
    },
    winnerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
    },
    disputeReason: {
        type: String,
        maxlength: 1000,
    },
    challengerEvidence: {
        images: {
            type: [String],
            validate: [(val) => val.length <= 2, "Дээд тал нь 2 зураг"],
        },
        description: {
            type: String,
            maxlength: 500,
        },
    },
    opponentEvidence: {
        images: {
            type: [String],
            validate: [(val) => val.length <= 2, "Дээд тал нь 2 зураг"],
        },
        description: {
            type: String,
            maxlength: 500,
        },
    },
    adminResolution: {
        type: String,
        enum: Object.values(AdminResolution),
    },
    resolvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    resolvedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ type: 1, status: 1 });
matchSchema.index({ deadline: 1 });
matchSchema.index({ resultDeadline: 1 });
exports.default = mongoose_1.default.model("Match", matchSchema);
