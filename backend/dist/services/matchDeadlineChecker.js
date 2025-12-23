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
exports.MatchDeadlineChecker = void 0;
const Match_1 = __importStar(require("../models/Match"));
const matchService2_1 = require("./matchService2");
const Notification_1 = __importDefault(require("../models/Notification"));
const Squad_1 = __importDefault(require("../models/Squad"));
class MatchDeadlineChecker {
    static start() {
        if (this.interval) {
            console.log("⚠️ Match deadline checker already running");
            return;
        }
        console.log("✅ Match deadline checker started");
        this.interval = setInterval(async () => {
            await this.checkExpiredDeadlines();
        }, 2 * 60 * 1000);
        this.checkExpiredDeadlines();
    }
    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log("🛑 Match deadline checker stopped");
        }
    }
    static async checkExpiredDeadlines() {
        try {
            const now = new Date();
            const expiredMatches = await Match_1.default.find({
                status: {
                    $in: [Match_1.MatchStatus.PLAYING, Match_1.MatchStatus.RESULT_SUBMITTED],
                },
                resultDeadline: { $lte: now },
            })
                .populate("challengerSquadId")
                .populate("opponentSquadId");
            console.log(`🔍 Found ${expiredMatches.length} matches with expired deadlines`);
            for (const match of expiredMatches) {
                await this.handleExpiredMatch(match);
            }
        }
        catch (error) {
            console.error("❌ Error checking expired deadlines:", error);
        }
    }
    static async handleExpiredMatch(match) {
        try {
            const challengerSquad = match.challengerSquadId;
            const opponentSquad = match.opponentSquadId;
            console.log(`⏰ Processing expired match: ${challengerSquad.name} vs ${opponentSquad.name}`);
            const currentMatch = await Match_1.default.findById(match._id);
            if (!currentMatch ||
                currentMatch.status === Match_1.MatchStatus.COMPLETED ||
                currentMatch.status === Match_1.MatchStatus.CANCELLED) {
                console.log(`⏭️  Match ${match._id} already processed, skipping`);
                return;
            }
            if (match.challengerResult && match.opponentResult) {
                match.status = Match_1.MatchStatus.DISPUTED;
                match.disputeReason =
                    "Автоматаар dispute үүссэн: 15 минутын хугацаанд үр дүн тохирохгүй байна";
                await match.save();
                const User = (await Promise.resolve().then(() => __importStar(require("../models/User")))).default;
                const admins = await User.find({ role: "ADMIN" });
                for (const admin of admins) {
                    await Notification_1.default.create({
                        userId: admin._id,
                        title: "Автомат dispute",
                        content: `${challengerSquad.name} vs ${opponentSquad.name} - Deadline хугацаа дууссан, үр дүн зөрсөн`,
                        type: "SYSTEM",
                    });
                }
                console.log(`🚨 Match ${match._id} автоматаар disputed болсон`);
            }
            else if (match.challengerResult || match.opponentResult) {
                const submittedResult = match.challengerResult || match.opponentResult;
                const isChallenger = !!match.challengerResult;
                match.challengerResult = isChallenger
                    ? submittedResult
                    : submittedResult === "WIN"
                        ? "LOSS"
                        : "WIN";
                match.opponentResult = !isChallenger
                    ? submittedResult
                    : submittedResult === "WIN"
                        ? "LOSS"
                        : "WIN";
                await matchService2_1.MatchService2.completeMatch(match);
                await Notification_1.default.create({
                    userId: challengerSquad.leader,
                    title: "Match дууссан",
                    content: "15 минутын deadline хугацаа дууссан тул үр дүн автоматаар батлагдлаа",
                    type: "SYSTEM",
                });
                await Notification_1.default.create({
                    userId: opponentSquad.leader,
                    title: "Match дууссан",
                    content: "15 минутын deadline хугацаа дууссан тул үр дүн автоматаар батлагдлаа",
                    type: "SYSTEM",
                });
                console.log(`✅ Match ${match._id} автоматаар дууссан`);
            }
            else {
                match.status = Match_1.MatchStatus.COMPLETED;
                match.completedAt = new Date();
                await Squad_1.default.findByIdAndUpdate(challengerSquad._id, {
                    $inc: { currentBountyCoins: match.bountyAmount },
                });
                await Squad_1.default.findByIdAndUpdate(opponentSquad._id, {
                    $inc: { currentBountyCoins: match.bountyAmount },
                });
                await match.save();
                await Notification_1.default.create({
                    userId: challengerSquad.leader,
                    title: "Match цуцлагдсан",
                    content: "15 минутын deadline хугацаанд үр дүн оруулаагүй тул coin буцаагдлаа",
                    type: "SYSTEM",
                });
                await Notification_1.default.create({
                    userId: opponentSquad.leader,
                    title: "Match цуцлагдсан",
                    content: "15 минутын deadline хугацаанд үр дүн оруулаагүй тул coin буцаагдлаа",
                    type: "SYSTEM",
                });
                console.log(`💰 Match ${match._id} цуцлагдаж, coin буцаагдсан (хэн ч үр дүн оруулаагүй)`);
            }
        }
        catch (error) {
            console.error(`❌ Error handling expired match ${match._id}:`, error);
        }
    }
}
exports.MatchDeadlineChecker = MatchDeadlineChecker;
MatchDeadlineChecker.interval = null;
