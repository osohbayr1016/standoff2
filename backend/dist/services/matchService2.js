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
exports.MatchService2 = void 0;
const Match_1 = __importStar(require("../models/Match"));
const Squad_1 = __importDefault(require("../models/Squad"));
class MatchService2 {
    static async startMatch(matchId, userId) {
        const match = await Match_1.default.findById(matchId);
        if (!match)
            throw new Error("Match not found");
        const squad = await Squad_1.default.findOne({ leader: userId, isActive: true });
        if (!squad)
            throw new Error("You are not a squad leader");
        const isChallenger = match.challengerSquadId.toString() === squad._id.toString();
        const isOpponent = match.opponentSquadId?.toString() === squad._id.toString();
        if (!isChallenger && !isOpponent) {
            throw new Error("You are not part of this match");
        }
        if (match.status !== Match_1.MatchStatus.ACCEPTED) {
            throw new Error("Cannot start this match");
        }
        match.status = Match_1.MatchStatus.PLAYING;
        match.startedAt = new Date();
        await match.save();
        return match;
    }
    static async submitResult(matchId, userId, result) {
        const match = await Match_1.default.findById(matchId);
        if (!match)
            throw new Error("Match not found");
        const squad = await Squad_1.default.findOne({ leader: userId, isActive: true });
        if (!squad)
            throw new Error("You are not a squad leader");
        match.status = Match_1.MatchStatus.RESULT_SUBMITTED;
        await match.save();
        return match;
    }
    static async completeMatch(matchId) {
        const match = await Match_1.default.findById(matchId);
        if (!match)
            throw new Error("Match not found");
        match.status = Match_1.MatchStatus.COMPLETED;
        await match.save();
        return match;
    }
    static async checkExpiredMatches() {
        const expiredMatches = await Match_1.default.find({
            status: Match_1.MatchStatus.PENDING,
            deadline: { $lt: new Date() },
        });
        return expiredMatches;
    }
}
exports.MatchService2 = MatchService2;
exports.default = MatchService2;
