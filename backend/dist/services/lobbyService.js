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
exports.LobbyService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MatchLobby_1 = __importStar(require("../models/MatchLobby"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
class LobbyService {
    static async createLobby(leaderId, map, link) {
        try {
            const leaderProfile = await PlayerProfile_1.default.findOne({ userId: leaderId });
            if (!leaderProfile) {
                throw new Error("Leader profile not found");
            }
            const player = {
                userId: new mongoose_1.default.Types.ObjectId(leaderId),
                isReady: true,
                standoff2Id: leaderProfile.standoff2Id,
                inGameName: leaderProfile.inGameName,
                elo: leaderProfile.elo || 1000,
                avatar: leaderProfile.avatar,
                team: "alpha",
            };
            const lobby = await MatchLobby_1.default.create({
                leader: new mongoose_1.default.Types.ObjectId(leaderId),
                lobbyLink: link,
                selectedMap: map,
                players: [player],
                teamAlpha: [new mongoose_1.default.Types.ObjectId(leaderId)],
                teamBravo: [],
                status: MatchLobby_1.LobbyStatus.OPEN,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                allPlayersReady: false,
            });
            return lobby;
        }
        catch (error) {
            throw new Error(error.message || "Failed to create lobby");
        }
    }
    static async getActiveLobbies() {
        try {
            return await MatchLobby_1.default.find({
                status: { $in: [MatchLobby_1.LobbyStatus.OPEN, MatchLobby_1.LobbyStatus.FULL] },
                expiresAt: { $gt: new Date() },
            })
                .populate("leader", "name avatar")
                .sort({ createdAt: -1 });
        }
        catch (error) {
            console.error("Error getting active lobbies:", error);
            return [];
        }
    }
    static async joinLobby(lobbyId, userId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby)
                throw new Error("Lobby not found");
            if (lobby.status === MatchLobby_1.LobbyStatus.CANCELLED)
                throw new Error("Lobby cancelled");
            if (lobby.players.length >= 10)
                throw new Error("Lobby full");
            const existingPlayer = lobby.players.find(p => p.userId.toString() === userId);
            if (existingPlayer)
                return lobby;
            const profile = await PlayerProfile_1.default.findOne({ userId });
            if (!profile)
                throw new Error("User profile not found");
            const newPlayer = {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                isReady: false,
                standoff2Id: profile.standoff2Id,
                inGameName: profile.inGameName,
                elo: profile.elo || 1000,
                avatar: profile.avatar,
                team: null,
            };
            lobby.players.push(newPlayer);
            if (lobby.players.length === 10) {
                lobby.status = MatchLobby_1.LobbyStatus.FULL;
            }
            await lobby.save();
            return lobby;
        }
        catch (error) {
            throw new Error(error.message || "Failed to join lobby");
        }
    }
    static async leaveLobby(lobbyId, userId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby)
                return null;
            if (lobby.leader.toString() === userId) {
                lobby.status = MatchLobby_1.LobbyStatus.CANCELLED;
            }
            else {
                lobby.players = lobby.players.filter(p => p.userId.toString() !== userId);
                lobby.teamAlpha = lobby.teamAlpha.filter(id => id.toString() !== userId);
                lobby.teamBravo = lobby.teamBravo.filter(id => id.toString() !== userId);
                if (lobby.status === MatchLobby_1.LobbyStatus.FULL && lobby.players.length < 10) {
                    lobby.status = MatchLobby_1.LobbyStatus.OPEN;
                }
            }
            await lobby.save();
            return lobby;
        }
        catch (error) {
            console.error("Error leaving lobby:", error);
            return null;
        }
    }
    static async selectTeam(lobbyId, userId, team) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby)
                throw new Error("Lobby not found");
            const player = lobby.players.find(p => p.userId.toString() === userId);
            if (!player)
                throw new Error("Player not in lobby");
            if (team === "alpha" && lobby.teamAlpha.length >= 5)
                throw new Error("Team Alpha full");
            if (team === "bravo" && lobby.teamBravo.length >= 5)
                throw new Error("Team Bravo full");
            lobby.teamAlpha = lobby.teamAlpha.filter(id => id.toString() !== userId);
            lobby.teamBravo = lobby.teamBravo.filter(id => id.toString() !== userId);
            if (team === "alpha") {
                lobby.teamAlpha.push(new mongoose_1.default.Types.ObjectId(userId));
            }
            else {
                lobby.teamBravo.push(new mongoose_1.default.Types.ObjectId(userId));
            }
            player.team = team;
            await lobby.save();
            return lobby;
        }
        catch (error) {
            throw new Error(error.message || "Failed to select team");
        }
    }
    static async kickPlayer(lobbyId, leaderId, targetUserId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby)
                throw new Error("Lobby not found");
            if (lobby.leader.toString() !== leaderId)
                throw new Error("Only leader can kick");
            if (leaderId === targetUserId)
                throw new Error("Cannot kick yourself");
            lobby.players = lobby.players.filter(p => p.userId.toString() !== targetUserId);
            lobby.teamAlpha = lobby.teamAlpha.filter(id => id.toString() !== targetUserId);
            lobby.teamBravo = lobby.teamBravo.filter(id => id.toString() !== targetUserId);
            if (lobby.status === MatchLobby_1.LobbyStatus.FULL && lobby.players.length < 10) {
                lobby.status = MatchLobby_1.LobbyStatus.OPEN;
            }
            await lobby.save();
            return lobby;
        }
        catch (error) {
            throw new Error(error.message || "Failed to kick player");
        }
    }
    static async markPlayerReady(lobbyId, userId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby)
                throw new Error("Lobby not found");
            if (lobby.status === MatchLobby_1.LobbyStatus.CANCELLED)
                throw new Error("Lobby cancelled");
            const player = lobby.players.find((p) => p.userId.toString() === userId);
            if (!player)
                throw new Error("Player not in this lobby");
            player.isReady = true;
            const allReady = lobby.players.length >= 2 && lobby.players.every((p) => p.isReady);
            lobby.allPlayersReady = allReady;
            if (allReady) {
                lobby.status = MatchLobby_1.LobbyStatus.ALL_READY;
            }
            await lobby.save();
            return { success: true, lobby, allReady };
        }
        catch (error) {
            throw new Error(error.message || "Failed to mark player as ready");
        }
    }
    static async getLobby(lobbyId) {
        return await MatchLobby_1.default.findById(lobbyId).populate("leader", "name avatar");
    }
}
exports.LobbyService = LobbyService;
