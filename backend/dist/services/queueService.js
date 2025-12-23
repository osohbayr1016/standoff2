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
exports.QueueService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MatchmakingQueue_1 = __importDefault(require("../models/MatchmakingQueue"));
const MatchLobby_1 = __importStar(require("../models/MatchLobby"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
class QueueService {
    static async addToQueue(userId, partyMembers = []) {
        try {
            const allMembers = [userId, ...partyMembers];
            const profiles = await PlayerProfile_1.default.find({
                userId: { $in: allMembers },
            });
            if (profiles.length !== allMembers.length) {
                throw new Error("One or more party members don't have a profile");
            }
            const missingIds = profiles.filter((p) => !p.standoff2Id);
            if (missingIds.length > 0) {
                throw new Error("All party members must have a Standoff2 ID set in their profile");
            }
            if (allMembers.length > 5) {
                throw new Error("Party size cannot exceed 5 players");
            }
            const averageElo = profiles.reduce((sum, p) => sum + (p.elo || 1000), 0) /
                profiles.length;
            const existing = await MatchmakingQueue_1.default.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            });
            if (existing) {
                throw new Error("Already in queue");
            }
            const queueEntry = await MatchmakingQueue_1.default.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                partyMembers: allMembers.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                partySize: allMembers.length,
                averageElo,
                joinedAt: new Date(),
            });
            return {
                success: true,
                queueEntry,
                position: await this.getQueuePosition(userId),
            };
        }
        catch (error) {
            throw new Error(error.message || "Failed to join queue");
        }
    }
    static async removeFromQueue(userId) {
        try {
            const result = await MatchmakingQueue_1.default.deleteOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            });
            return result.deletedCount > 0;
        }
        catch (error) {
            console.error("Error removing from queue:", error);
            return false;
        }
    }
    static async getQueuePosition(userId) {
        try {
            const userEntry = await MatchmakingQueue_1.default.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            });
            if (!userEntry)
                return -1;
            const position = await MatchmakingQueue_1.default.countDocuments({
                joinedAt: { $lt: userEntry.joinedAt },
            });
            return position + 1;
        }
        catch (error) {
            console.error("Error getting queue position:", error);
            return -1;
        }
    }
    static async getTotalInQueue() {
        try {
            const entries = await MatchmakingQueue_1.default.find();
            return entries.reduce((sum, entry) => sum + entry.partySize, 0);
        }
        catch (error) {
            console.error("Error getting queue count:", error);
            return 0;
        }
    }
    static async getQueuePlayers() {
        try {
            const queueEntries = await MatchmakingQueue_1.default.find()
                .sort({ joinedAt: 1 })
                .lean();
            const allPlayerIds = [];
            queueEntries.forEach((entry) => {
                allPlayerIds.push(...entry.partyMembers);
            });
            const profiles = await PlayerProfile_1.default.find({
                userId: { $in: allPlayerIds },
            })
                .select("userId inGameName elo")
                .lean();
            return profiles.map((profile) => ({
                userId: profile.userId.toString(),
                inGameName: profile.inGameName,
                elo: profile.elo || 1000,
            }));
        }
        catch (error) {
            console.error("Error getting queue players:", error);
            return [];
        }
    }
    static async findMatch() {
        try {
            const queueEntries = await MatchmakingQueue_1.default.find()
                .sort({ joinedAt: 1 })
                .lean();
            if (queueEntries.length === 0)
                return null;
            const selectedPlayers = [];
            const selectedEntries = [];
            let totalPlayers = 0;
            for (const entry of queueEntries) {
                if (totalPlayers + entry.partySize <= 10) {
                    selectedPlayers.push(...entry.partyMembers);
                    selectedEntries.push(entry);
                    totalPlayers += entry.partySize;
                    if (totalPlayers === 10)
                        break;
                }
            }
            if (totalPlayers !== 10)
                return null;
            const lobbyId = await this.createLobbyFromQueue(selectedPlayers);
            await MatchmakingQueue_1.default.deleteMany({
                _id: { $in: selectedEntries.map((e) => e._id) },
            });
            return lobbyId;
        }
        catch (error) {
            console.error("Error finding match:", error);
            return null;
        }
    }
    static async createLobbyFromQueue(playerIds) {
        try {
            if (playerIds.length !== 10) {
                throw new Error("Must have exactly 10 players");
            }
            const profiles = await PlayerProfile_1.default.find({
                userId: { $in: playerIds },
            }).lean();
            if (profiles.length !== 10) {
                throw new Error("Could not find all player profiles");
            }
            profiles.sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
            const teamAlpha = [];
            const teamBravo = [];
            for (let i = 0; i < profiles.length; i++) {
                if (i === 0 || i === 3 || i === 4 || i === 7 || i === 8) {
                    teamAlpha.push(profiles[i].userId);
                }
                else {
                    teamBravo.push(profiles[i].userId);
                }
            }
            const lobbyPlayers = profiles.map((profile) => ({
                userId: profile.userId,
                isReady: false,
                standoff2Id: profile.standoff2Id,
                inGameName: profile.inGameName,
                elo: profile.elo || 1000,
                avatar: profile.avatar,
            }));
            const lobby = await MatchLobby_1.default.create({
                players: lobbyPlayers,
                teamAlpha,
                teamBravo,
                status: MatchLobby_1.LobbyStatus.READY_PHASE,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                allPlayersReady: false,
            });
            return lobby._id.toString();
        }
        catch (error) {
            console.error("Error creating lobby:", error);
            throw new Error(error.message || "Failed to create lobby");
        }
    }
    static async markPlayerReady(lobbyId, userId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            if (lobby.status === MatchLobby_1.LobbyStatus.CANCELLED) {
                throw new Error("Lobby has been cancelled");
            }
            if (lobby.status === MatchLobby_1.LobbyStatus.ALL_READY) {
                throw new Error("All players are already ready");
            }
            const playerIndex = lobby.players.findIndex((p) => p.userId.toString() === userId);
            if (playerIndex === -1) {
                throw new Error("Player not in this lobby");
            }
            if (lobby.players[playerIndex].isReady) {
                throw new Error("Player is already ready");
            }
            lobby.players[playerIndex].isReady = true;
            const allReady = lobby.players.every((p) => p.isReady);
            lobby.allPlayersReady = allReady;
            if (allReady) {
                lobby.status = MatchLobby_1.LobbyStatus.ALL_READY;
            }
            await lobby.save();
            return {
                success: true,
                lobby,
                allReady,
            };
        }
        catch (error) {
            throw new Error(error.message || "Failed to mark player as ready");
        }
    }
    static async cancelLobby(lobbyId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby)
                return false;
            lobby.status = MatchLobby_1.LobbyStatus.CANCELLED;
            await lobby.save();
            return true;
        }
        catch (error) {
            console.error("Error cancelling lobby:", error);
            return false;
        }
    }
    static async getLobby(lobbyId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            return lobby;
        }
        catch (error) {
            throw new Error(error.message || "Failed to get lobby");
        }
    }
    static async cleanupExpiredLobbies() {
        try {
            const now = new Date();
            await MatchLobby_1.default.updateMany({
                expiresAt: { $lt: now },
                status: { $ne: MatchLobby_1.LobbyStatus.CANCELLED },
            }, {
                $set: { status: MatchLobby_1.LobbyStatus.CANCELLED },
            });
        }
        catch (error) {
            console.error("Error cleaning up expired lobbies:", error);
        }
    }
}
exports.QueueService = QueueService;
