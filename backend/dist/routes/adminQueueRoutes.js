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
const botService_1 = require("../services/botService");
const queueService_1 = require("../services/queueService");
const MatchLobby_1 = __importStar(require("../models/MatchLobby"));
const mongoose_1 = __importDefault(require("mongoose"));
const adminQueueRoutes = async (fastify) => {
    fastify.post("/fill-bots", { preHandler: [auth_1.authenticateToken, auth_1.requireAdmin] }, async (request, reply) => {
        try {
            console.log("🤖 Admin filling queue with bots...");
            const currentQueueCount = await queueService_1.QueueService.getTotalInQueue();
            console.log(`📊 Current queue count: ${currentQueueCount}/10`);
            if (currentQueueCount >= 10) {
                return reply.status(400).send({
                    success: false,
                    message: "Queue is already full",
                    data: { currentQueueCount },
                });
            }
            const botsNeeded = 10 - currentQueueCount;
            console.log(`🤖 Need ${botsNeeded} bots to fill queue`);
            const botUserIds = await botService_1.BotService.getBotUserIds(botsNeeded);
            console.log(`✅ Got ${botUserIds.length} bot user IDs`);
            const addedBots = [];
            for (const botUserId of botUserIds) {
                try {
                    await queueService_1.QueueService.addToQueue(botUserId, []);
                    addedBots.push(botUserId);
                    console.log(`✅ Added bot ${botUserId} to queue`);
                }
                catch (error) {
                    console.log(`⚠️ Bot ${botUserId} might already be in queue: ${error.message}`);
                }
            }
            const newQueueCount = await queueService_1.QueueService.getTotalInQueue();
            console.log(`📊 New queue count: ${newQueueCount}/10`);
            const socketManager = fastify.socketManager;
            if (socketManager) {
                socketManager.broadcastQueueUpdate(newQueueCount);
            }
            if (newQueueCount >= 10) {
                console.log("🎯 Queue full! Attempting to create match...");
                await new Promise(resolve => setTimeout(resolve, 500));
                try {
                    const lobbyId = await queueService_1.QueueService.findMatch();
                    if (lobbyId) {
                        console.log(`🎮 Match created: ${lobbyId}`);
                        const lobby = await queueService_1.QueueService.getLobby(lobbyId);
                        const playerIds = lobby.players.map((p) => p.userId.toString());
                        if (socketManager) {
                            socketManager.notifyLobbyFound(playerIds, {
                                lobbyId,
                                players: lobby.players,
                                teamAlpha: lobby.teamAlpha,
                                teamBravo: lobby.teamBravo,
                            });
                            socketManager.broadcastQueueUpdate(await queueService_1.QueueService.getTotalInQueue());
                        }
                    }
                }
                catch (error) {
                    console.error("Error creating match:", error);
                }
            }
            return reply.send({
                success: true,
                message: `Added ${addedBots.length} bots to queue`,
                data: {
                    botsAdded: addedBots.length,
                    currentQueueCount: newQueueCount,
                    addedBotIds: addedBots,
                },
            });
        }
        catch (error) {
            console.error("Fill bots error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to fill queue with bots",
            });
        }
    });
    fastify.post("/lobby/:id/ready-all", { preHandler: [auth_1.authenticateToken, auth_1.requireAdmin] }, async (request, reply) => {
        try {
            const { id } = request.params;
            console.log(`🤖 Admin marking all players ready in lobby ${id}`);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid lobby ID",
                });
            }
            const lobby = await MatchLobby_1.default.findById(id);
            if (!lobby) {
                return reply.status(404).send({
                    success: false,
                    message: "Lobby not found",
                });
            }
            if (lobby.status === MatchLobby_1.LobbyStatus.CANCELLED) {
                return reply.status(400).send({
                    success: false,
                    message: "Lobby has been cancelled",
                });
            }
            if (lobby.allPlayersReady) {
                return reply.status(400).send({
                    success: false,
                    message: "All players are already ready",
                });
            }
            lobby.players.forEach((player) => {
                player.isReady = true;
            });
            lobby.allPlayersReady = true;
            lobby.status = MatchLobby_1.LobbyStatus.ALL_READY;
            await lobby.save();
            console.log(`✅ All players marked ready in lobby ${id}`);
            const socketManager = fastify.socketManager;
            if (socketManager && socketManager.getIO()) {
                socketManager.getIO().to(`lobby_${id}`).emit("lobby_update", {
                    lobby: {
                        players: lobby.players,
                    },
                    allReady: true,
                });
                socketManager.getIO().to(`lobby_${id}`).emit("all_players_ready", {
                    lobby: {
                        players: lobby.players,
                    },
                });
            }
            return reply.send({
                success: true,
                message: "All players marked as ready",
                data: {
                    lobby: {
                        _id: lobby._id,
                        players: lobby.players,
                        allPlayersReady: lobby.allPlayersReady,
                        status: lobby.status,
                    },
                },
            });
        }
        catch (error) {
            console.error("Ready all error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to mark all players as ready",
            });
        }
    });
    fastify.post("/clear-bots", { preHandler: [auth_1.authenticateToken, auth_1.requireAdmin] }, async (request, reply) => {
        try {
            console.log("🧹 Admin clearing bots from queue...");
            const removedCount = await botService_1.BotService.clearBotsFromQueue();
            const socketManager = fastify.socketManager;
            if (socketManager) {
                const newQueueCount = await queueService_1.QueueService.getTotalInQueue();
                socketManager.broadcastQueueUpdate(newQueueCount);
            }
            return reply.send({
                success: true,
                message: `Removed ${removedCount} bots from queue`,
                data: {
                    removedCount,
                },
            });
        }
        catch (error) {
            console.error("Clear bots error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to clear bots from queue",
            });
        }
    });
};
exports.default = adminQueueRoutes;
