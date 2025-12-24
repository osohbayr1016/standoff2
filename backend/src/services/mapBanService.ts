import MatchLobby, { LobbyStatus } from "../models/MatchLobby";
import mongoose from "mongoose";
import { BotService } from "./botService";

// Standoff 2 default maps
export const STANDOFF2_MAPS = [
  "Hanami",
  "Rust",
  "Zone 7",
  "Dune",
  "Breeze",
  "Province",
  "Sandstone",
];

export class MapBanService {
  // Determine team leaders (highest ELO from each team)
  static determineTeamLeaders(lobby: any): {
    alphaLeader: mongoose.Types.ObjectId | null;
    bravoLeader: mongoose.Types.ObjectId | null;
  } {
    const alphaPlayers = lobby.players.filter((p: any) =>
      lobby.teamAlpha.some(
        (id: mongoose.Types.ObjectId) => id.toString() === p.userId.toString()
      )
    );

    const bravoPlayers = lobby.players.filter((p: any) =>
      lobby.teamBravo.some(
        (id: mongoose.Types.ObjectId) => id.toString() === p.userId.toString()
      )
    );

    // Sort by ELO descending and get highest
    const alphaLeader =
      alphaPlayers.length > 0
        ? alphaPlayers.sort((a: any, b: any) => b.elo - a.elo)[0].userId
        : null;

    const bravoLeader =
      bravoPlayers.length > 0
        ? bravoPlayers.sort((a: any, b: any) => b.elo - a.elo)[0].userId
        : null;

    return {
      alphaLeader: alphaLeader
        ? new mongoose.Types.ObjectId(alphaLeader)
        : null,
      bravoLeader: bravoLeader
        ? new mongoose.Types.ObjectId(bravoLeader)
        : null,
    };
  }

  // Initialize map ban phase
  static async initializeMapBan(lobbyId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) {
        throw new Error("Lobby not found");
      }

      // Determine team leaders
      const { alphaLeader, bravoLeader } = this.determineTeamLeaders(lobby);

      // Initialize map ban
      lobby.mapBanPhase = true;
      lobby.status = LobbyStatus.MAP_BAN_PHASE;
      lobby.availableMaps = [...STANDOFF2_MAPS];
      lobby.bannedMaps = [];
      lobby.banHistory = [];
      lobby.currentBanTeam = "alpha"; // Team Alpha goes first
      lobby.teamAlphaLeader = alphaLeader;
      lobby.teamBravoLeader = bravoLeader;

      await lobby.save();

      // Check if team leaders are bots and auto-ban if needed
      setTimeout(async () => {
        await this.autoBanForBots(lobbyId);
      }, 500);

      return lobby;
    } catch (error: any) {
      console.error("Error initializing map ban:", error);
      throw new Error(`Failed to initialize map ban: ${error.message}`);
    }
  }

  // Ban a map
  static async banMap(
    lobbyId: string,
    userId: string,
    mapName: string
  ): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) {
        throw new Error("Lobby not found");
      }

      if (!lobby.mapBanPhase) {
        throw new Error("Map ban phase is not active");
      }

      // Check if map is already banned
      if (lobby.bannedMaps.includes(mapName)) {
        throw new Error("Map is already banned");
      }

      // Check if map exists in available maps
      if (!lobby.availableMaps.includes(mapName)) {
        throw new Error("Map not found in available maps");
      }

      // Determine which team the user belongs to
      const isAlphaLeader =
        lobby.teamAlphaLeader?.toString() === userId.toString();
      const isBravoLeader =
        lobby.teamBravoLeader?.toString() === userId.toString();

      if (!isAlphaLeader && !isBravoLeader) {
        throw new Error("Only team leaders can ban maps");
      }

      // Check if it's this team's turn
      const userTeam = isAlphaLeader ? "alpha" : "bravo";
      if (lobby.currentBanTeam !== userTeam) {
        throw new Error(`It's ${lobby.currentBanTeam}'s turn to ban`);
      }

      // Ban the map
      lobby.bannedMaps.push(mapName);
      lobby.availableMaps = lobby.availableMaps.filter((m) => m !== mapName);

      // Add to ban history
      lobby.banHistory.push({
        team: userTeam,
        map: mapName,
        timestamp: new Date(),
      });

      // Check if ban phase is complete (1 map remaining)
      if (lobby.availableMaps.length === 1) {
        lobby.selectedMap = lobby.availableMaps[0];
        lobby.mapBanPhase = false;
        lobby.status = LobbyStatus.READY_PHASE;
        lobby.currentBanTeam = undefined;
      } else {
        // Switch to other team
        lobby.currentBanTeam = userTeam === "alpha" ? "bravo" : "alpha";
      }

      await lobby.save();

      // If ban phase is still active, check if next team leader is a bot
      if (lobby.mapBanPhase && lobby.currentBanTeam) {
        setTimeout(async () => {
          await this.autoBanForBots(lobbyId);
        }, 500);
      }

      return lobby;
    } catch (error: any) {
      console.error("Error banning map:", error);
      throw new Error(`Failed to ban map: ${error.message}`);
    }
  }

  // Get map ban status
  static async getMapBanStatus(lobbyId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId)
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
    } catch (error: any) {
      console.error("Error getting map ban status:", error);
      throw new Error(`Failed to get map ban status: ${error.message}`);
    }
  }

  // Complete map ban (when 1 map remains)
  static async completeMapBan(lobbyId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) {
        throw new Error("Lobby not found");
      }

      if (lobby.availableMaps.length !== 1) {
        throw new Error("Map ban phase is not complete");
      }

      lobby.selectedMap = lobby.availableMaps[0];
      lobby.mapBanPhase = false;
      lobby.status = LobbyStatus.READY_PHASE;
      lobby.currentBanTeam = undefined;

      await lobby.save();
      return lobby;
    } catch (error: any) {
      console.error("Error completing map ban:", error);
      throw new Error(`Failed to complete map ban: ${error.message}`);
    }
  }

  // Auto-ban for bots
  static async autoBanForBots(lobbyId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby || !lobby.mapBanPhase) {
        return null;
      }

      // Get current team leader
      const currentLeaderId =
        lobby.currentBanTeam === "alpha"
          ? lobby.teamAlphaLeader
          : lobby.teamBravoLeader;

      if (!currentLeaderId) {
        return null;
      }

      // Check if current leader is a bot
      const isBot = await BotService.isBot(currentLeaderId.toString());
      if (!isBot) {
        return null;
      }

      // Bot's turn - auto-ban a random available map
      if (lobby.availableMaps.length > 1) {
        const randomMap =
          lobby.availableMaps[
            Math.floor(Math.random() * lobby.availableMaps.length)
          ];
        console.log(
          `🤖 Bot leader (${currentLeaderId}) auto-banning map: ${randomMap}`
        );

        // Use the banMap method
        const updatedLobby = await this.banMap(
          lobbyId,
          currentLeaderId.toString(),
          randomMap
        );

        // If ban phase is still active and next team is also a bot, continue
        if (updatedLobby.mapBanPhase && updatedLobby.currentBanTeam) {
          const nextLeaderId =
            updatedLobby.currentBanTeam === "alpha"
              ? updatedLobby.teamAlphaLeader
              : updatedLobby.teamBravoLeader;

          if (nextLeaderId) {
            const nextIsBot = await BotService.isBot(nextLeaderId.toString());
            if (nextIsBot) {
              // Next team is also a bot, continue auto-banning after a short delay
              setTimeout(() => {
                this.autoBanForBots(lobbyId);
              }, 1000);
            }
          }
        }

        return updatedLobby;
      }

      return null;
    } catch (error: any) {
      console.error("Error auto-banning for bots:", error);
      return null;
    }
  }
}

