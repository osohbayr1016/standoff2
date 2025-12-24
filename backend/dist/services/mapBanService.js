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
exports.MapBanService = exports.STANDOFF2_MAPS = void 0;
const MatchLobby_1 = __importStar(require("../models/MatchLobby"));
const mongoose_1 = __importDefault(require("mongoose"));
const botService_1 = require("./botService");
exports.STANDOFF2_MAPS = [
    "Hanami",
    "Rust",
    "Zone 7",
    "Dune",
    "Breeze",
    "Province",
    "Sandstone",
];
class MapBanService {
    static determineTeamLeaders(lobby) {
        const alphaPlayers = lobby.players.filter((p) => lobby.teamAlpha.some((id) => id.toString() === p.userId.toString()));
        const bravoPlayers = lobby.players.filter((p) => lobby.teamBravo.some((id) => id.toString() === p.userId.toString()));
        const alphaLeader = alphaPlayers.length > 0
            ? alphaPlayers.sort((a, b) => b.elo - a.elo)[0].userId
            : null;
        const bravoLeader = bravoPlayers.length > 0
            ? bravoPlayers.sort((a, b) => b.elo - a.elo)[0].userId
            : null;
        return {
            alphaLeader: alphaLeader
                ? new mongoose_1.default.Types.ObjectId(alphaLeader)
                : null,
            bravoLeader: bravoLeader
                ? new mongoose_1.default.Types.ObjectId(bravoLeader)
                : null,
        };
    }
    static async initializeMapBan(lobbyId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            const { alphaLeader, bravoLeader } = this.determineTeamLeaders(lobby);
            lobby.mapBanPhase = true;
            lobby.status = MatchLobby_1.LobbyStatus.MAP_BAN_PHASE;
            lobby.availableMaps = [...exports.STANDOFF2_MAPS];
            lobby.bannedMaps = [];
            lobby.banHistory = [];
            lobby.currentBanTeam = "alpha";
            lobby.teamAlphaLeader = alphaLeader;
            lobby.teamBravoLeader = bravoLeader;
            await lobby.save();
            setTimeout(async () => {
                await this.autoBanForBots(lobbyId);
            }, 500);
            return lobby;
        }
        catch (error) {
            console.error("Error initializing map ban:", error);
            throw new Error(`Failed to initialize map ban: ${error.message}`);
        }
    }
    static async banMap(lobbyId, userId, mapName) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            if (!lobby.mapBanPhase) {
                throw new Error("Map ban phase is not active");
            }
            if (lobby.bannedMaps.includes(mapName)) {
                throw new Error("Map is already banned");
            }
            if (!lobby.availableMaps.includes(mapName)) {
                throw new Error("Map not found in available maps");
            }
            const isAlphaLeader = lobby.teamAlphaLeader?.toString() === userId.toString();
            const isBravoLeader = lobby.teamBravoLeader?.toString() === userId.toString();
            if (!isAlphaLeader && !isBravoLeader) {
                throw new Error("Only team leaders can ban maps");
            }
            const userTeam = isAlphaLeader ? "alpha" : "bravo";
            if (lobby.currentBanTeam !== userTeam) {
                throw new Error(`It's ${lobby.currentBanTeam}'s turn to ban`);
            }
            lobby.bannedMaps.push(mapName);
            lobby.availableMaps = lobby.availableMaps.filter((m) => m !== mapName);
            lobby.banHistory.push({
                team: userTeam,
                map: mapName,
                timestamp: new Date(),
            });
            if (lobby.availableMaps.length === 1) {
                lobby.selectedMap = lobby.availableMaps[0];
                lobby.mapBanPhase = false;
                lobby.status = MatchLobby_1.LobbyStatus.READY_PHASE;
                lobby.currentBanTeam = undefined;
            }
            else {
                lobby.currentBanTeam = userTeam === "alpha" ? "bravo" : "alpha";
            }
            await lobby.save();
            if (lobby.mapBanPhase && lobby.currentBanTeam) {
                setTimeout(async () => {
                    await this.autoBanForBots(lobbyId);
                }, 500);
            }
            return lobby;
        }
        catch (error) {
            console.error("Error banning map:", error);
            throw new Error(`Failed to ban map: ${error.message}`);
        }
    }
    static async getMapBanStatus(lobbyId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId)
                .populate("teamAlphaLeader", "name email")
                .populate("teamBravoLeader", "name email")
                .lean();
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            return {
                mapBanPhase: lobby.mapBanPhase,
                availableMaps: lobby.availableMaps || [],
                bannedMaps: lobby.bannedMaps || [],
                selectedMap: lobby.selectedMap,
                currentBanTeam: lobby.currentBanTeam,
                teamAlphaLeader: lobby.teamAlphaLeader,
                teamBravoLeader: lobby.teamBravoLeader,
                banHistory: lobby.banHistory || [],
            };
        }
        catch (error) {
            console.error("Error getting map ban status:", error);
            throw new Error(`Failed to get map ban status: ${error.message}`);
        }
    }
    static async completeMapBan(lobbyId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby) {
                throw new Error("Lobby not found");
            }
            if (lobby.availableMaps.length !== 1) {
                throw new Error("Map ban phase is not complete");
            }
            lobby.selectedMap = lobby.availableMaps[0];
            lobby.mapBanPhase = false;
            lobby.status = MatchLobby_1.LobbyStatus.READY_PHASE;
            lobby.currentBanTeam = undefined;
            await lobby.save();
            return lobby;
        }
        catch (error) {
            console.error("Error completing map ban:", error);
            throw new Error(`Failed to complete map ban: ${error.message}`);
        }
    }
    static async autoBanForBots(lobbyId) {
        try {
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby || !lobby.mapBanPhase) {
                return null;
            }
            const currentLeaderId = lobby.currentBanTeam === "alpha"
                ? lobby.teamAlphaLeader
                : lobby.teamBravoLeader;
            if (!currentLeaderId) {
                return null;
            }
            const isBot = await botService_1.BotService.isBot(currentLeaderId.toString());
            if (!isBot) {
                return null;
            }
            if (lobby.availableMaps.length > 1) {
                const randomMap = lobby.availableMaps[Math.floor(Math.random() * lobby.availableMaps.length)];
                console.log(`🤖 Bot leader (${currentLeaderId}) auto-banning map: ${randomMap}`);
                const updatedLobby = await this.banMap(lobbyId, currentLeaderId.toString(), randomMap);
                if (updatedLobby.mapBanPhase && updatedLobby.currentBanTeam) {
                    const nextLeaderId = updatedLobby.currentBanTeam === "alpha"
                        ? updatedLobby.teamAlphaLeader
                        : updatedLobby.teamBravoLeader;
                    if (nextLeaderId) {
                        const nextIsBot = await botService_1.BotService.isBot(nextLeaderId.toString());
                        if (nextIsBot) {
                            setTimeout(() => {
                                this.autoBanForBots(lobbyId);
                            }, 1000);
                        }
                    }
                }
                return updatedLobby;
            }
            return null;
        }
        catch (error) {
            console.error("Error auto-banning for bots:", error);
            return null;
        }
    }
}
exports.MapBanService = MapBanService;
