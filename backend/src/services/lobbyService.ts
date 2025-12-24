import mongoose from "mongoose";
import MatchLobby, { LobbyStatus, ILobbyPlayer } from "../models/MatchLobby";
import PlayerProfile from "../models/PlayerProfile";
import User from "../models/User";

export class LobbyService {
  /**
   * Create a new lobby
   */
  static async createLobby(
    leaderId: string,
    map: string,
    link: string
  ): Promise<any> {
    try {
      const leaderProfile = await PlayerProfile.findOne({ userId: new mongoose.Types.ObjectId(leaderId) });
      if (!leaderProfile) {
        throw new Error("profile-аа нээгээрэй Bro");
      }

      const player: ILobbyPlayer = {
        userId: new mongoose.Types.ObjectId(leaderId),
        isReady: true,
        standoff2Id: leaderProfile.standoff2Id,
        inGameName: leaderProfile.inGameName,
        elo: leaderProfile.elo || 1000,
        avatar: leaderProfile.avatar,
        team: "alpha", // Leader joins Alpha by default
      };

      const lobby = await MatchLobby.create({
        leader: new mongoose.Types.ObjectId(leaderId),
        lobbyLink: link,
        selectedMap: map,
        players: [player],
        teamAlpha: [new mongoose.Types.ObjectId(leaderId)],
        teamBravo: [],
        status: LobbyStatus.OPEN,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        allPlayersReady: false,
      });

      return lobby;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create lobby");
    }
  }

  /**
   * Get all active lobbies
   */
  static async getActiveLobbies(): Promise<any[]> {
    try {
      return await MatchLobby.find({
        status: { $in: [LobbyStatus.OPEN, LobbyStatus.FULL] },
        expiresAt: { $gt: new Date() },
      })
        .populate("leader", "name avatar")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error getting active lobbies:", error);
      return [];
    }
  }

  /**
   * Join a lobby
   */
  static async joinLobby(lobbyId: string, userId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) throw new Error("Lobby not found");
      if (lobby.status === LobbyStatus.CANCELLED) throw new Error("Lobby cancelled");
      if (lobby.players.length >= 10) throw new Error("Lobby full");

      const existingPlayer = lobby.players.find(p => p.userId.toString() === userId);
      if (existingPlayer) return lobby;

      const profile = await PlayerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!profile) throw new Error("profile-аа нээгээрэй Bro");

      const newPlayer: ILobbyPlayer = {
        userId: new mongoose.Types.ObjectId(userId),
        isReady: false,
        standoff2Id: profile.standoff2Id,
        inGameName: profile.inGameName,
        elo: profile.elo || 1000,
        avatar: profile.avatar,
        team: null,
      };

      lobby.players.push(newPlayer);
      if (lobby.players.length === 10) {
        lobby.status = LobbyStatus.FULL;
      }

      await lobby.save();
      return lobby;
    } catch (error: any) {
      throw new Error(error.message || "Failed to join lobby");
    }
  }

  /**
   * Leave a lobby
   */
  static async leaveLobby(lobbyId: string, userId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) return null;

      // If leader leaves, cancel lobby (or we could transfer leadership)
      if (lobby.leader.toString() === userId) {
        lobby.status = LobbyStatus.CANCELLED;
      } else {
        lobby.players = lobby.players.filter(p => p.userId.toString() !== userId);
        lobby.teamAlpha = lobby.teamAlpha.filter(id => id.toString() !== userId);
        lobby.teamBravo = lobby.teamBravo.filter(id => id.toString() !== userId);

        if (lobby.status === LobbyStatus.FULL && lobby.players.length < 10) {
          lobby.status = LobbyStatus.OPEN;
        }
      }

      await lobby.save();
      return lobby;
    } catch (error) {
      console.error("Error leaving lobby:", error);
      return null;
    }
  }

  /**
   * Select team
   */
  static async selectTeam(lobbyId: string, userId: string, team: "alpha" | "bravo"): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) throw new Error("Lobby not found");

      console.log(`[selectTeam] Looking for userId: "${userId}"`);
      console.log(`[selectTeam] Players in lobby:`, lobby.players.map(p => ({
        userId: p.userId.toString(),
        inGameName: p.inGameName,
        team: p.team
      })));

      const player = lobby.players.find(p => p.userId.toString() === userId);
      if (!player) {
        console.error(`[selectTeam] Player not found! userId: "${userId}"`);
        const profile = await PlayerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (!profile) {
          throw new Error("profile-аа нээгээрэй Bro");
        }
        throw new Error("profile-аа нээгээрэй Bro");
      }

      console.log(`[selectTeam] Player found: ${player.inGameName}, current team: ${player.team}, switching to: ${team}`);

      // Remove from current team FIRST
      lobby.teamAlpha = lobby.teamAlpha.filter(id => id.toString() !== userId);
      lobby.teamBravo = lobby.teamBravo.filter(id => id.toString() !== userId);

      // NOW check team capacity (after removing player from their old team)
      if (team === "alpha" && lobby.teamAlpha.length >= 5) throw new Error("Team Alpha full");
      if (team === "bravo" && lobby.teamBravo.length >= 5) throw new Error("Team Bravo full");

      // Add to new team
      if (team === "alpha") {
        lobby.teamAlpha.push(new mongoose.Types.ObjectId(userId));
      } else {
        lobby.teamBravo.push(new mongoose.Types.ObjectId(userId));
      }

      player.team = team;
      await lobby.save();

      console.log(`[selectTeam] Team selection successful. Alpha: ${lobby.teamAlpha.length}, Bravo: ${lobby.teamBravo.length}`);
      return lobby;
    } catch (error: any) {
      console.error(`[selectTeam] Error:`, error.message);
      throw new Error(error.message || "Failed to select team");
    }
  }

  /**
   * Kick player
   */
  static async kickPlayer(lobbyId: string, leaderId: string, targetUserId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) throw new Error("Lobby not found");
      if (lobby.leader.toString() !== leaderId) throw new Error("Only leader can kick");
      if (leaderId === targetUserId) throw new Error("Cannot kick yourself");

      lobby.players = lobby.players.filter(p => p.userId.toString() !== targetUserId);
      lobby.teamAlpha = lobby.teamAlpha.filter(id => id.toString() !== targetUserId);
      lobby.teamBravo = lobby.teamBravo.filter(id => id.toString() !== targetUserId);

      if (lobby.status === LobbyStatus.FULL && lobby.players.length < 10) {
        lobby.status = LobbyStatus.OPEN;
      }

      await lobby.save();
      return lobby;
    } catch (error: any) {
      throw new Error(error.message || "Failed to kick player");
    }
  }

  /**
   * Mark a player as ready in a lobby
   */
  static async markPlayerReady(lobbyId: string, userId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) throw new Error("Lobby not found");
      if (lobby.status === LobbyStatus.CANCELLED) throw new Error("Lobby cancelled");

      const player = lobby.players.find((p) => p.userId.toString() === userId);
      if (!player) {
        const profile = await PlayerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (!profile) {
          throw new Error("profile-аа нээгээрэй Bro");
        }
        throw new Error("profile-аа нээгээрэй Bro");
      }

      player.isReady = true;

      // Check if all players are ready
      const allReady = lobby.players.length >= 2 && lobby.players.every((p) => p.isReady);
      lobby.allPlayersReady = allReady;

      if (allReady) {
        lobby.status = LobbyStatus.ALL_READY;
      }

      await lobby.save();
      return { success: true, lobby, allReady };
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark player as ready");
    }
  }

  /**
   * Get lobby by ID
   */
  static async getLobby(lobbyId: string): Promise<any> {
    return await MatchLobby.findById(lobbyId).populate("leader", "name avatar");
  }
}

