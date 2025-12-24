import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, requireAdmin, AuthenticatedRequest } from "../middleware/auth";
import { BotService } from "../services/botService";
import { QueueService } from "../services/queueService";
import MatchLobby, { LobbyStatus } from "../models/MatchLobby";
import mongoose from "mongoose";

const adminQueueRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Fill queue with bots to reach 10 players
  fastify.post(
    "/fill-bots",
    { preHandler: [authenticateToken, requireAdmin] },
    async (request, reply) => {
      try {
        console.log("🤖 Admin filling queue with bots...");
        
        // Get current queue count
        const currentQueueCount = await QueueService.getTotalInQueue();
        console.log(`📊 Current queue count: ${currentQueueCount}/10`);
        
        if (currentQueueCount >= 10) {
          return reply.status(400).send({
            success: false,
            message: "Queue is already full",
            data: { currentQueueCount },
          });
        }
        
        // Calculate how many bots needed
        const botsNeeded = 10 - currentQueueCount;
        console.log(`🤖 Need ${botsNeeded} bots to fill queue`);
        
        // Get bot user IDs
        const botUserIds = await BotService.getBotUserIds(botsNeeded);
        console.log(`✅ Got ${botUserIds.length} bot user IDs`);
        
        // Add each bot to the queue
        const addedBots: string[] = [];
        for (const botUserId of botUserIds) {
          try {
            await QueueService.addToQueue(botUserId, []);
            addedBots.push(botUserId);
            console.log(`✅ Added bot ${botUserId} to queue`);
          } catch (error: any) {
            console.log(`⚠️ Bot ${botUserId} might already be in queue: ${error.message}`);
          }
        }
        
        // Get new queue count
        const newQueueCount = await QueueService.getTotalInQueue();
        console.log(`📊 New queue count: ${newQueueCount}/10`);
        
        // Get socket manager from fastify app instance
        const socketManager = (fastify as any).socketManager;
        if (socketManager) {
          socketManager.broadcastQueueUpdate(newQueueCount);
        }
        
        // If we hit 10 players, try to create a match immediately
        if (newQueueCount >= 10) {
          console.log("🎯 Queue full! Attempting to create match...");
          // Wait a bit for all database operations to complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            const lobbyId = await QueueService.findMatch();
            if (lobbyId) {
              console.log(`🎮 Match created: ${lobbyId}`);
              const lobby = await QueueService.getLobby(lobbyId);
              const playerIds = lobby.players.map((p: any) => p.userId.toString());
              
              if (socketManager) {
                socketManager.notifyLobbyFound(playerIds, {
                  lobbyId,
                  players: lobby.players,
                  teamAlpha: lobby.teamAlpha,
                  teamBravo: lobby.teamBravo,
                });
                socketManager.broadcastQueueUpdate(await QueueService.getTotalInQueue());
              }
            }
          } catch (error) {
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
      } catch (error: any) {
        console.error("Fill bots error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to fill queue with bots",
        });
      }
    }
  );

  // Mark all players in a lobby as ready
  fastify.post<{ Params: { id: string } }>(
    "/lobby/:id/ready-all",
    { preHandler: [authenticateToken, requireAdmin] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        console.log(`🤖 Admin marking all players ready in lobby ${id}`);
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: "Invalid lobby ID",
          });
        }
        
        const lobby = await MatchLobby.findById(id);
        
        if (!lobby) {
          return reply.status(404).send({
            success: false,
            message: "Lobby not found",
          });
        }
        
        if (lobby.status === LobbyStatus.CANCELLED) {
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
        
        // Mark all players as ready
        lobby.players.forEach((player) => {
          player.isReady = true;
        });
        
        lobby.allPlayersReady = true;
        lobby.status = LobbyStatus.ALL_READY;
        
        await lobby.save();
        console.log(`✅ All players marked ready in lobby ${id}`);
        
        // Broadcast update via socket
        const socketManager = (fastify as any).socketManager;
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
      } catch (error: any) {
        console.error("Ready all error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to mark all players as ready",
        });
      }
    }
  );

  // Clear all bots from queue
  fastify.post(
    "/clear-bots",
    { preHandler: [authenticateToken, requireAdmin] },
    async (request, reply) => {
      try {
        console.log("🧹 Admin clearing bots from queue...");
        
        const removedCount = await BotService.clearBotsFromQueue();
        
        // Broadcast queue update
        const socketManager = (fastify as any).socketManager;
        if (socketManager) {
          const newQueueCount = await QueueService.getTotalInQueue();
          socketManager.broadcastQueueUpdate(newQueueCount);
        }
        
        return reply.send({
          success: true,
          message: `Removed ${removedCount} bots from queue`,
          data: {
            removedCount,
          },
        });
      } catch (error: any) {
        console.error("Clear bots error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to clear bots from queue",
        });
      }
    }
  );
};

export default adminQueueRoutes;

