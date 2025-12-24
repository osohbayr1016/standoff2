import mongoose from "mongoose";
import MatchmakingQueue from "../models/MatchmakingQueue";
import MatchLobby, { LobbyStatus, ILobbyPlayer } from "../models/MatchLobby";
import PlayerProfile from "../models/PlayerProfile";
import { MapBanService } from "./mapBanService";

export class QueueService {
  /**
   * Add a player or party to the matchmaking queue
   */
  static async addToQueue(
    userId: string,
    partyMembers: string[] = []
  ): Promise<any> {
    try {
      // Validate that all party members exist and have profiles
      const allMembers = [userId, ...partyMembers];
      const profiles = await PlayerProfile.find({
        userId: { $in: allMembers },
      });

      if (profiles.length !== allMembers.length) {
        throw new Error("profile-аа нээгээрэй Bro");
      }

      // Validate that all members have standoff2Id
      const missingIds = profiles.filter((p) => !p.standoff2Id);
      if (missingIds.length > 0) {
        throw new Error(
          "All party members must have a Standoff2 ID set in their profile"
        );
      }

      // Check party size
      if (allMembers.length > 5) {
        throw new Error("Party size cannot exceed 5 players");
      }

      // Calculate average ELO
      const averageElo =
        profiles.reduce((sum, p) => sum + (p.elo || 1000), 0) / profiles.length;

      // Check if already in queue
      const existing = await MatchmakingQueue.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (existing) {
        throw new Error("Already in queue");
      }

      // Add to queue
      const queueEntry = await MatchmakingQueue.create({
        userId: new mongoose.Types.ObjectId(userId),
        partyMembers: allMembers.map((id) => new mongoose.Types.ObjectId(id)),
        partySize: allMembers.length,
        averageElo,
        joinedAt: new Date(),
      });

      return {
        success: true,
        queueEntry,
        position: await this.getQueuePosition(userId),
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to join queue");
    }
  }

  /**
   * Remove a player from the queue
   */
  static async removeFromQueue(userId: string): Promise<boolean> {
    try {
      const result = await MatchmakingQueue.deleteOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error removing from queue:", error);
      return false;
    }
  }

  /**
   * Get player's position in queue
   */
  static async getQueuePosition(userId: string): Promise<number> {
    try {
      const userEntry = await MatchmakingQueue.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!userEntry) return -1;

      const position = await MatchmakingQueue.countDocuments({
        joinedAt: { $lt: userEntry.joinedAt },
      });

      return position + 1;
    } catch (error) {
      console.error("Error getting queue position:", error);
      return -1;
    }
  }

  /**
   * Get total players in queue
   */
  static async getTotalInQueue(): Promise<number> {
    try {
      const entries = await MatchmakingQueue.find();
      const total = entries.reduce((sum, entry) => sum + entry.partySize, 0);
      // Only log when we're close to a match (8+ players)
      if (total >= 8) {
        console.log(
          `📊 Queue count: ${entries.length} entries, ${total} total players`
        );
      }
      return total;
    } catch (error) {
      console.error("Error getting queue count:", error);
      return 0;
    }
  }

  /**
   * Get all players in queue with their details
   */
  static async getQueuePlayers(): Promise<any[]> {
    try {
      const queueEntries = await MatchmakingQueue.find()
        .sort({ joinedAt: 1 })
        .lean();

      const allPlayerIds: mongoose.Types.ObjectId[] = [];
      queueEntries.forEach((entry) => {
        allPlayerIds.push(...entry.partyMembers);
      });

      // Get player profiles
      const profiles = await PlayerProfile.find({
        userId: { $in: allPlayerIds },
      })
        .select("userId inGameName elo")
        .lean();

      return profiles.map((profile) => ({
        userId: profile.userId.toString(),
        inGameName: profile.inGameName,
        elo: profile.elo || 1000,
      }));
    } catch (error) {
      console.error("Error getting queue players:", error);
      return [];
    }
  }

  /**
   * Find a match - try to match 10 players
   * @deprecated Automated matching is replaced by manual lobbies
   */
  static async findMatch(): Promise<string | null> {
    return null;
  }

  /**
   * Create a lobby from matched players
   * @deprecated Automated matching is replaced by manual lobbies
   */
  static async createLobbyFromQueue(
    playerIds: mongoose.Types.ObjectId[]
  ): Promise<string> {
    throw new Error("Automated lobby creation is disabled");
  }

  /**
   * Mark a player as ready in a lobby
   * @deprecated Use LobbyService.markPlayerReady
   */
  static async markPlayerReady(lobbyId: string, userId: string): Promise<any> {
    const { LobbyService } = await import("./lobbyService");
    return LobbyService.markPlayerReady(lobbyId, userId);
  }

  /**
   * Cancel a lobby (when a player leaves)
   * @deprecated Use LobbyService.leaveLobby or similar
   */
  static async cancelLobby(lobbyId: string): Promise<boolean> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) return false;
      lobby.status = LobbyStatus.CANCELLED;
      await lobby.save();
      return true;
    } catch (error) {
      console.error("Error cancelling lobby:", error);
      return false;
    }
  }

  /**
   * Get lobby details
   * @deprecated Use LobbyService.getLobby
   */
  static async getLobby(lobbyId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);
      if (!lobby) throw new Error("Lobby not found");
      return lobby;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get lobby");
    }
  }

  /**
   * Get user's active lobby (if they are in one)
   */
  static async getUserActiveLobby(userId: string): Promise<any | null> {
    try {
      const userIdObj = new mongoose.Types.ObjectId(userId);
      const now = new Date();

      // Find lobbies where user is a player, status is active, and not expired
      const lobby = await MatchLobby.findOne({
        "players.userId": userIdObj,
        status: { $in: [LobbyStatus.OPEN, LobbyStatus.FULL, LobbyStatus.ALL_READY] },
        expiresAt: { $gt: now },
      })
        .select(
          "_id players teamAlpha teamBravo status allPlayersReady createdAt expiresAt"
        )
        .lean();

      if (!lobby) {
        return null;
      }

      return {
        lobbyId: lobby._id.toString(),
        players: lobby.players,
        teamAlpha: lobby.teamAlpha,
        teamBravo: lobby.teamBravo,
        status: lobby.status,
        allPlayersReady: lobby.allPlayersReady,
        createdAt: lobby.createdAt,
        expiresAt: lobby.expiresAt,
      };
    } catch (error: any) {
      console.error("Error getting user active lobby:", error);
      return null;
    }
  }

  /**
   * Clean up expired lobbies
   */
  static async cleanupExpiredLobbies(): Promise<void> {
    try {
      const now = new Date();
      await MatchLobby.updateMany(
        {
          expiresAt: { $lt: now },
          status: { $ne: LobbyStatus.CANCELLED },
        },
        {
          $set: { status: LobbyStatus.CANCELLED },
        }
      );
    } catch (error) {
      console.error("Error cleaning up expired lobbies:", error);
    }
  }
}
