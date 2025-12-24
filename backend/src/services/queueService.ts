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
        throw new Error("One or more party members don't have a profile");
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
   */
  static async findMatch(): Promise<string | null> {
    try {
      // Get all queue entries sorted by join time (FIFO)
      const queueEntries = await MatchmakingQueue.find()
        .sort({ joinedAt: 1 })
        .lean();

      console.log(
        `🔍 Checking for matches: ${queueEntries.length} queue entries`
      );

      if (queueEntries.length === 0) return null;

      // Try to collect 10 players
      const selectedPlayers: mongoose.Types.ObjectId[] = [];
      const selectedEntries: any[] = [];
      let totalPlayers = 0;

      for (const entry of queueEntries) {
        if (totalPlayers + entry.partySize <= 10) {
          selectedPlayers.push(...entry.partyMembers);
          selectedEntries.push(entry);
          totalPlayers += entry.partySize;

          if (totalPlayers === 10) break;
        }
      }

      console.log(`👥 Total players found: ${totalPlayers}/10`);

      // Need exactly 10 players
      if (totalPlayers !== 10) {
        console.log(`⏳ Waiting for more players (${totalPlayers}/10)`);
        return null;
      }

      console.log(`🎯 10 players found! Creating lobby...`);

      // Create lobby
      const lobbyId = await this.createLobbyFromQueue(selectedPlayers);

      console.log(`✅ Lobby created: ${lobbyId}`);

      // Remove selected players from queue
      await MatchmakingQueue.deleteMany({
        _id: { $in: selectedEntries.map((e) => e._id) },
      });

      console.log(`🧹 Removed ${selectedEntries.length} entries from queue`);

      return lobbyId;
    } catch (error) {
      console.error("❌ Error finding match:", error);
      return null;
    }
  }

  /**
   * Create a lobby from matched players
   */
  static async createLobbyFromQueue(
    playerIds: mongoose.Types.ObjectId[]
  ): Promise<string> {
    try {
      console.log(`🎮 Creating lobby for ${playerIds.length} players`);

      if (playerIds.length !== 10) {
        throw new Error(
          `Must have exactly 10 players, got ${playerIds.length}`
        );
      }

      // Get player profiles
      console.log(`🔍 Fetching player profiles...`);
      const profiles = await PlayerProfile.find({
        userId: { $in: playerIds },
      }).lean();

      console.log(
        `📊 Found ${profiles.length} profiles out of ${playerIds.length} players`
      );

      if (profiles.length !== 10) {
        console.error(`❌ Missing profiles for players:`, {
          expected: playerIds.map((id) => id.toString()),
          found: profiles.map((p) => p.userId.toString()),
        });
        throw new Error(
          `Could not find all player profiles (found ${profiles.length}/10)`
        );
      }

      // Check if all players have standoff2Id
      const missingStandoff2Id = profiles.filter((p) => !p.standoff2Id);
      if (missingStandoff2Id.length > 0) {
        console.error(
          `❌ Players missing standoff2Id:`,
          missingStandoff2Id.map((p) => ({
            userId: p.userId.toString(),
            inGameName: p.inGameName,
          }))
        );
        throw new Error(
          `${missingStandoff2Id.length} players missing Standoff2 ID`
        );
      }

      // Sort by ELO for balanced teams
      profiles.sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
      console.log(
        `⚖️ Sorted players by ELO:`,
        profiles.map((p) => ({ name: p.inGameName, elo: p.elo }))
      );

      // Distribute players in a balanced way (snake draft style)
      // Team Alpha gets: 1st, 4th, 5th, 8th, 9th
      // Team Bravo gets: 2nd, 3rd, 6th, 7th, 10th
      const teamAlpha: mongoose.Types.ObjectId[] = [];
      const teamBravo: mongoose.Types.ObjectId[] = [];

      for (let i = 0; i < profiles.length; i++) {
        if (i === 0 || i === 3 || i === 4 || i === 7 || i === 8) {
          teamAlpha.push(profiles[i].userId);
        } else {
          teamBravo.push(profiles[i].userId);
        }
      }

      console.log(`🔵 Team Alpha: ${teamAlpha.length} players`);
      console.log(`🔴 Team Bravo: ${teamBravo.length} players`);

      // Create lobby players array
      const lobbyPlayers: ILobbyPlayer[] = profiles.map((profile) => ({
        userId: profile.userId,
        isReady: false,
        standoff2Id: profile.standoff2Id,
        inGameName: profile.inGameName,
        elo: profile.elo || 1000,
        avatar: profile.avatar,
      }));

      // Create lobby
      console.log(`💾 Saving lobby to database...`);
      const lobby = await MatchLobby.create({
        players: lobbyPlayers,
        teamAlpha,
        teamBravo,
        status: LobbyStatus.MAP_BAN_PHASE,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        allPlayersReady: false,
      });

      console.log(`✅ Lobby created successfully: ${lobby._id.toString()}`);

      // Initialize map ban phase
      console.log(`🗺️ Initializing map ban phase...`);
      await MapBanService.initializeMapBan(lobby._id.toString());
      console.log(`✅ Map ban phase initialized`);

      return lobby._id.toString();
    } catch (error: any) {
      console.error("❌ Error creating lobby:", error);
      console.error("Stack trace:", error.stack);
      throw new Error(error.message || "Failed to create lobby");
    }
  }

  /**
   * Mark a player as ready in a lobby
   */
  static async markPlayerReady(lobbyId: string, userId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);

      if (!lobby) {
        throw new Error("Lobby not found");
      }

      if (lobby.status === LobbyStatus.CANCELLED) {
        throw new Error("Lobby has been cancelled");
      }

      if (lobby.status === LobbyStatus.ALL_READY) {
        throw new Error("All players are already ready");
      }

      // Find player and mark as ready
      const playerIndex = lobby.players.findIndex(
        (p) => p.userId.toString() === userId
      );

      if (playerIndex === -1) {
        throw new Error("Player not in this lobby");
      }

      if (lobby.players[playerIndex].isReady) {
        throw new Error("Player is already ready");
      }

      lobby.players[playerIndex].isReady = true;

      // Check if all players are ready
      const allReady = lobby.players.every((p) => p.isReady);
      lobby.allPlayersReady = allReady;

      if (allReady) {
        lobby.status = LobbyStatus.ALL_READY;
      }

      await lobby.save();

      return {
        success: true,
        lobby,
        allReady,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark player as ready");
    }
  }

  /**
   * Cancel a lobby (when a player leaves)
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
   */
  static async getLobby(lobbyId: string): Promise<any> {
    try {
      const lobby = await MatchLobby.findById(lobbyId);

      if (!lobby) {
        throw new Error("Lobby not found");
      }

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
        status: { $in: [LobbyStatus.READY_PHASE, LobbyStatus.ALL_READY] },
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
