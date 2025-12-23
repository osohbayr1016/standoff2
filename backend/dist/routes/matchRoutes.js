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
const Match_1 = __importStar(require("../models/Match"));
const matchService_1 = require("../services/matchService");
const Squad_1 = __importDefault(require("../models/Squad"));
const auth_1 = require("../middleware/auth");
const matchRoutes = async (fastify) => {
    fastify.get("/", async (request, reply) => {
        try {
            const { type, status, limit = 20, page = 1 } = request.query;
            const query = {};
            if (type) {
                query.type = type;
            }
            else {
                query.$or = [
                    { type: Match_1.MatchType.PUBLIC },
                    { type: Match_1.MatchType.PRIVATE, status: { $ne: Match_1.MatchStatus.PENDING } },
                ];
            }
            if (status) {
                query.status = status;
            }
            else {
                query.status = {
                    $in: [Match_1.MatchStatus.PENDING, Match_1.MatchStatus.ACCEPTED, Match_1.MatchStatus.PLAYING],
                };
            }
            const skip = (page - 1) * limit;
            const matches = await Match_1.default.find(query)
                .populate("challengerSquadId", "name tag logo")
                .populate("opponentSquadId", "name tag logo")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await Match_1.default.countDocuments(query);
            return reply.send({
                success: true,
                data: matches,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    fastify.get("/my-squad", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { status, limit = 20, page = 1 } = request.query;
            const squads = await Squad_1.default.find({ members: request.user.id });
            if (!squads || squads.length === 0) {
                return reply.send({
                    success: true,
                    data: [],
                    pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 },
                });
            }
            const squadIds = squads.map(squad => squad._id);
            const query = {
                $or: [
                    { challengerSquadId: { $in: squadIds } },
                    { opponentSquadId: { $in: squadIds } }
                ],
            };
            if (status)
                query.status = status;
            const skip = (page - 1) * limit;
            const matches = await Match_1.default.find(query)
                .populate("challengerSquadId", "name tag logo")
                .populate("opponentSquadId", "name tag logo")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await Match_1.default.countDocuments(query);
            return reply.send({
                success: true,
                data: matches,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    fastify.get("/history", async (request, reply) => {
        try {
            const { limit = 20, page = 1, squadId } = request.query;
            const query = {
                status: { $in: [Match_1.MatchStatus.COMPLETED, Match_1.MatchStatus.CANCELLED] },
            };
            if (squadId) {
                query.$or = [
                    { challengerSquadId: squadId },
                    { opponentSquadId: squadId },
                ];
            }
            const skip = (page - 1) * limit;
            const matches = await Match_1.default.find(query)
                .populate("challengerSquadId", "name tag logo")
                .populate("opponentSquadId", "name tag logo")
                .populate("winnerId", "name tag logo")
                .sort({ completedAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await Match_1.default.countDocuments(query);
            return reply.send({
                success: true,
                data: matches,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    fastify.get("/history/all", async (request, reply) => {
        try {
            const { limit = 20, page = 1, squadId } = request.query;
            if (!squadId) {
                return reply.status(400).send({
                    success: false,
                    message: "Squad ID is required"
                });
            }
            const skip = (page - 1) * limit;
            const regularMatches = await Match_1.default.find({
                $or: [
                    { challengerSquadId: squadId },
                    { opponentSquadId: squadId },
                ],
                status: Match_1.MatchStatus.COMPLETED,
            })
                .populate("challengerSquadId", "name tag logo")
                .populate("opponentSquadId", "name tag logo")
                .populate("winnerId", "name tag logo")
                .sort({ completedAt: -1 })
                .lean();
            const cancelledMatches = await Match_1.default.find({
                $or: [
                    { challengerSquadId: squadId },
                    { opponentSquadId: squadId },
                ],
                status: Match_1.MatchStatus.CANCELLED,
            })
                .populate("challengerSquadId", "name tag logo")
                .populate("opponentSquadId", "name tag logo")
                .populate("winnerId", "name tag logo")
                .sort({ completedAt: -1 })
                .lean();
            const TournamentMatch = (await Promise.resolve().then(() => __importStar(require("../models/TournamentMatch")))).default;
            const tournamentMatches = await TournamentMatch.find({
                $or: [
                    { squad1: squadId },
                    { squad2: squadId },
                ],
                status: "completed",
            })
                .populate("squad1", "name tag logo")
                .populate("squad2", "name tag logo")
                .populate("winner", "name tag logo")
                .populate("tournament", "name")
                .sort({ endTime: -1 })
                .lean();
            const allMatches = [
                ...regularMatches.map(match => ({
                    ...match,
                    matchType: 'regular',
                    opponentSquad: match.challengerSquadId._id.toString() === squadId
                        ? match.opponentSquadId
                        : match.challengerSquadId,
                    isWinner: match.winnerId && match.winnerId._id.toString() === squadId,
                    bountyAmount: match.bountyAmount || 0,
                    completedAt: match.completedAt,
                    status: 'completed',
                })),
                ...cancelledMatches.map(match => ({
                    ...match,
                    matchType: 'regular',
                    opponentSquad: match.challengerSquadId._id.toString() === squadId
                        ? match.opponentSquadId
                        : match.challengerSquadId,
                    isWinner: false,
                    bountyAmount: match.bountyAmount || 0,
                    completedAt: match.completedAt,
                    status: 'cancelled',
                })),
                ...tournamentMatches.map(match => ({
                    ...match,
                    matchType: 'tournament',
                    opponentSquad: match.squad1._id.toString() === squadId
                        ? match.squad2
                        : match.squad1,
                    isWinner: match.winner && match.winner._id.toString() === squadId,
                    bountyAmount: match.bountyCoinAmount || 0,
                    completedAt: match.endTime,
                    status: 'completed',
                }))
            ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
            const paginatedMatches = allMatches.slice(skip, skip + limit);
            const total = allMatches.length;
            return reply.send({
                success: true,
                data: paginatedMatches,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    fastify.get("/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            const match = await Match_1.default.findById(id)
                .populate("challengerSquadId")
                .populate("opponentSquadId")
                .populate("winnerId", "name tag logo")
                .populate("resolvedBy", "name email");
            if (!match) {
                return reply
                    .status(404)
                    .send({ success: false, message: "Match олдсонгүй" });
            }
            return reply.send({ success: true, data: match });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    fastify.post("/", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { type, opponentSquadId, bountyAmount, deadline } = request.body;
            const match = await matchService_1.MatchService.createMatch(request.user.id, type, opponentSquadId, bountyAmount, new Date(deadline));
            return reply.status(201).send({ success: true, data: match });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
};
exports.default = matchRoutes;
