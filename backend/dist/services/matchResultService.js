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
exports.MatchResultService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
const MatchLobby_1 = __importDefault(require("../models/MatchLobby"));
const MatchResult_1 = __importStar(require("../models/MatchResult"));
const ELO_CHANGE = 25;
class MatchResultService {
    static async updateTeamElo(lobbyId, winnerTeam) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId).session(session);
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            const winnerTeamIds = winnerTeam === "alpha" ? lobby.teamAlpha : lobby.teamBravo;
            const loserTeamIds = winnerTeam === "alpha" ? lobby.teamBravo : lobby.teamAlpha;
            if (winnerTeamIds.length > 0) {
                await PlayerProfile_1.default.updateMany({ userId: { $in: winnerTeamIds } }, {
                    $inc: {
                        elo: ELO_CHANGE,
                        wins: 1,
                        totalMatches: 1,
                    },
                }, { session });
            }
            if (loserTeamIds.length > 0) {
                const loserProfiles = await PlayerProfile_1.default.find({
                    userId: { $in: loserTeamIds },
                }).session(session);
                const bulkOps = loserProfiles.map((profile) => ({
                    updateOne: {
                        filter: { _id: profile._id },
                        update: {
                            $inc: {
                                losses: 1,
                                totalMatches: 1,
                            },
                            $set: {
                                elo: Math.max(0, profile.elo - ELO_CHANGE),
                            },
                        },
                    },
                }));
                if (bulkOps.length > 0) {
                    await PlayerProfile_1.default.bulkWrite(bulkOps, { session });
                }
            }
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async approveResult(resultId, winnerTeam, moderatorId, moderatorNotes) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const matchResult = await MatchResult_1.default.findById(resultId).session(session);
            if (!matchResult) {
                throw new Error("Match result not found");
            }
            if (matchResult.status !== MatchResult_1.ResultStatus.PENDING) {
                throw new Error("Match result is not pending");
            }
            await this.updateTeamElo(matchResult.matchLobbyId.toString(), winnerTeam);
            matchResult.status = MatchResult_1.ResultStatus.APPROVED;
            matchResult.winnerTeam = winnerTeam;
            matchResult.reviewedBy = new mongoose_1.default.Types.ObjectId(moderatorId);
            matchResult.reviewedAt = new Date();
            if (moderatorNotes) {
                matchResult.moderatorNotes = moderatorNotes;
            }
            await matchResult.save({ session });
            await session.commitTransaction();
            return matchResult;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async rejectResult(resultId, moderatorId, reviewNotes) {
        const matchResult = await MatchResult_1.default.findById(resultId);
        if (!matchResult) {
            throw new Error("Match result not found");
        }
        if (matchResult.status !== MatchResult_1.ResultStatus.PENDING) {
            throw new Error("Match result is not pending");
        }
        matchResult.status = MatchResult_1.ResultStatus.REJECTED;
        matchResult.reviewedBy = new mongoose_1.default.Types.ObjectId(moderatorId);
        matchResult.reviewedAt = new Date();
        if (reviewNotes) {
            matchResult.reviewNotes = reviewNotes;
        }
        await matchResult.save();
        return matchResult;
    }
}
exports.MatchResultService = MatchResultService;
exports.default = MatchResultService;
