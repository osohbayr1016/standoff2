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
const auth_1 = require("../middleware/auth");
const MatchResult_1 = __importStar(require("../models/MatchResult"));
const MatchLobby_1 = __importDefault(require("../models/MatchLobby"));
const matchResultService_1 = __importDefault(require("../services/matchResultService"));
const moderatorRoutes = async (fastify) => {
    fastify.get("/match-results/pending", { preHandler: [auth_1.authenticateToken, auth_1.requireModerator] }, async (request, reply) => {
        try {
            console.log("🔍 Fetching pending match results...");
            const pendingResults = await MatchResult_1.default.find({
                status: MatchResult_1.ResultStatus.PENDING,
            })
                .populate("matchLobbyId")
                .populate("submittedBy", "name email")
                .sort({ submittedAt: -1 })
                .lean();
            console.log(`📊 Found ${pendingResults.length} pending match results`);
            const enrichedResults = await Promise.all(pendingResults.map(async (result) => {
                const lobbyId = result.matchLobbyId?._id || result.matchLobbyId;
                if (!lobbyId) {
                    console.log(`⚠️ Match result ${result._id} has no lobby ID`);
                    return {
                        ...result,
                        lobby: null,
                    };
                }
                const lobby = await MatchLobby_1.default.findById(lobbyId)
                    .populate({
                    path: "teamAlpha",
                    select: "name inGameName avatar",
                })
                    .populate({
                    path: "teamBravo",
                    select: "name inGameName avatar",
                })
                    .populate({
                    path: "players.userId",
                    select: "name inGameName avatar",
                })
                    .lean();
                if (!lobby) {
                    console.log(`⚠️ Lobby ${lobbyId} not found for match result ${result._id}`);
                    return {
                        ...result,
                        lobby: null,
                    };
                }
                return {
                    ...result,
                    lobby: {
                        _id: lobby._id,
                        teamAlpha: lobby.teamAlpha || [],
                        teamBravo: lobby.teamBravo || [],
                        selectedMap: lobby.selectedMap,
                        players: lobby.players || [],
                    },
                };
            }));
            return reply.send({
                success: true,
                data: enrichedResults || [],
            });
        }
        catch (error) {
            console.error("Error fetching pending results:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to fetch pending results",
            });
        }
    });
    fastify.get("/match-results", { preHandler: [auth_1.authenticateToken, auth_1.requireModerator] }, async (request, reply) => {
        try {
            const { status, limit = 50, offset = 0 } = request.query;
            const query = {};
            if (status && Object.values(MatchResult_1.ResultStatus).includes(status)) {
                query.status = status;
            }
            const results = await MatchResult_1.default.find(query)
                .populate("matchLobbyId")
                .populate("submittedBy", "name email")
                .populate("reviewedBy", "name email")
                .sort({ submittedAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(offset))
                .lean();
            const enrichedResults = await Promise.all(results.map(async (result) => {
                const lobby = await MatchLobby_1.default.findById(result.matchLobbyId._id || result.matchLobbyId)
                    .populate("teamAlpha", "name inGameName")
                    .populate("teamBravo", "name inGameName")
                    .lean();
                return {
                    ...result,
                    lobby: lobby
                        ? {
                            _id: lobby._id,
                            teamAlpha: lobby.teamAlpha,
                            teamBravo: lobby.teamBravo,
                            selectedMap: lobby.selectedMap,
                            players: lobby.players,
                        }
                        : null,
                };
            }));
            const total = await MatchResult_1.default.countDocuments(query);
            return reply.send({
                success: true,
                data: enrichedResults,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                },
            });
        }
        catch (error) {
            console.error("Error fetching results:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to fetch results",
            });
        }
    });
    fastify.get("/match-results/:resultId", { preHandler: [auth_1.authenticateToken, auth_1.requireModerator] }, async (request, reply) => {
        try {
            const { resultId } = request.params;
            const result = await MatchResult_1.default.findById(resultId)
                .populate("matchLobbyId")
                .populate("submittedBy", "name email avatar")
                .populate("reviewedBy", "name email")
                .lean();
            if (!result) {
                return reply.status(404).send({
                    success: false,
                    message: "Match result not found",
                });
            }
            const lobby = await MatchLobby_1.default.findById(result.matchLobbyId._id || result.matchLobbyId)
                .populate("teamAlpha", "name inGameName")
                .populate("teamBravo", "name inGameName")
                .lean();
            return reply.send({
                success: true,
                data: {
                    ...result,
                    lobby: lobby
                        ? {
                            _id: lobby._id,
                            teamAlpha: lobby.teamAlpha,
                            teamBravo: lobby.teamBravo,
                            selectedMap: lobby.selectedMap,
                            players: lobby.players,
                        }
                        : null,
                },
            });
        }
        catch (error) {
            console.error("Error fetching match result:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to fetch match result",
            });
        }
    });
    fastify.post("/match-results/:resultId/approve", { preHandler: [auth_1.authenticateToken, auth_1.requireModerator] }, async (request, reply) => {
        try {
            const { resultId } = request.params;
            const { winnerTeam, moderatorNotes } = request.body;
            if (!winnerTeam || !["alpha", "bravo"].includes(winnerTeam)) {
                return reply.status(400).send({
                    success: false,
                    message: "winnerTeam must be 'alpha' or 'bravo'",
                });
            }
            const result = await matchResultService_1.default.approveResult(resultId, winnerTeam, request.user.id, moderatorNotes);
            return reply.send({
                success: true,
                message: "Match result approved successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Error approving match result:", error);
            return reply.status(400).send({
                success: false,
                message: error.message || "Failed to approve match result",
            });
        }
    });
    fastify.post("/match-results/:resultId/reject", { preHandler: [auth_1.authenticateToken, auth_1.requireModerator] }, async (request, reply) => {
        try {
            const { resultId } = request.params;
            const { reviewNotes } = request.body;
            const result = await matchResultService_1.default.rejectResult(resultId, request.user.id, reviewNotes);
            return reply.send({
                success: true,
                message: "Match result rejected successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Error rejecting match result:", error);
            return reply.status(400).send({
                success: false,
                message: error.message || "Failed to reject match result",
            });
        }
    });
};
exports.default = moderatorRoutes;
