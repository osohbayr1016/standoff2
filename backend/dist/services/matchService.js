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
exports.MatchService = void 0;
const Match_1 = __importStar(require("../models/Match"));
const Squad_1 = __importDefault(require("../models/Squad"));
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
class MatchService {
    static async createMatch(userId, type, opponentSquadId, bountyAmount, deadline) {
        const squad = await Squad_1.default.findOne({ leader: userId, isActive: true });
        if (!squad) {
            throw new Error("Та squad-ийн лидер биш байна");
        }
        if (squad.members.length < 5) {
            throw new Error("Squad-д хамгийн багадаа 5 гишүүн байх ёстой");
        }
        if (squad.currentBountyCoins < bountyAmount) {
            throw new Error("Хангалтгүй bounty coin байна");
        }
        if (new Date(deadline) <= new Date()) {
            throw new Error("Deadline ирээдүйд байх ёстой");
        }
        if (type === Match_1.MatchType.PRIVATE) {
            if (!opponentSquadId) {
                throw new Error("Private match-д opponent squad заавал байх ёстой");
            }
            const opponentSquad = await Squad_1.default.findById(opponentSquadId);
            if (!opponentSquad) {
                throw new Error("Opponent squad олдсонгүй");
            }
            if (opponentSquad.members.length < 5) {
                throw new Error("Opponent squad-д хамгийн багадаа 5 гишүүн байх ёстой");
            }
            if (opponentSquad.currentBountyCoins < bountyAmount) {
                throw new Error("Opponent squad-д хангалтгүй bounty coin байна");
            }
        }
        const match = await Match_1.default.create({
            type,
            challengerSquadId: squad._id,
            opponentSquadId: opponentSquadId || undefined,
            bountyAmount,
            deadline,
            status: Match_1.MatchStatus.PENDING,
            coinsLocked: false,
        });
        if (type === Match_1.MatchType.PRIVATE && opponentSquadId) {
            const opponentSquad = await Squad_1.default.findById(opponentSquadId).populate("leader");
            if (opponentSquad) {
                await Notification_1.default.create({
                    userId: opponentSquad.leader,
                    title: "Шинэ match урилга",
                    content: `${squad.name} таны багтай ${bountyAmount} bounty coin-ий бооцоотой тоглох хүсэлт илгээлээ`,
                    type: "SYSTEM",
                });
            }
        }
        return match;
    }
    static async acceptMatch(matchId, userId) {
        const match = await Match_1.default.findById(matchId);
        if (!match) {
            throw new Error("Match олдсонгүй");
        }
        if (match.status !== Match_1.MatchStatus.PENDING) {
            throw new Error("Энэ match-ийг accept хийх боломжгүй");
        }
        const squad = await Squad_1.default.findOne({ leader: userId, isActive: true });
        if (!squad) {
            throw new Error("Та squad-ийн лидер биш байна");
        }
        if (match.type === Match_1.MatchType.PRIVATE) {
            if (!match.opponentSquadId ||
                match.opponentSquadId.toString() !== squad._id.toString()) {
                throw new Error("Та энэ match-д оролцох эрхгүй");
            }
        }
        else {
            if (match.challengerSquadId.toString() === squad._id.toString()) {
                throw new Error("Өөрийн match-ийг accept хийж болохгүй");
            }
            match.opponentSquadId = squad._id;
        }
        if (squad.members.length < 5) {
            throw new Error("Squad-д хамгийн багадаа 5 гишүүн байх ёстой");
        }
        if (squad.currentBountyCoins < match.bountyAmount) {
            throw new Error("Хангалтгүй bounty coin байна");
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            await Squad_1.default.findByIdAndUpdate(match.challengerSquadId, {
                $inc: { currentBountyCoins: -match.bountyAmount },
            }, { session });
            await Squad_1.default.findByIdAndUpdate(squad._id, {
                $inc: { currentBountyCoins: -match.bountyAmount },
            }, { session });
            match.status = Match_1.MatchStatus.ACCEPTED;
            match.coinsLocked = true;
            await match.save({ session });
            await session.commitTransaction();
            const challengerSquad = await Squad_1.default.findById(match.challengerSquadId).populate("leader");
            if (challengerSquad) {
                await Notification_1.default.create({
                    userId: challengerSquad.leader,
                    title: "Match accepted",
                    content: `${squad.name} таны match урилгыг хүлээн авлаа`,
                    type: "SYSTEM",
                });
            }
            return match;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
}
exports.MatchService = MatchService;
