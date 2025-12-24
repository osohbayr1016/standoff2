import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { QueueService } from "../services/queueService";
import mongoose from "mongoose";

const lobbyRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get user's active lobby
  fastify.get(
    "/user/active",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const activeLobby = await QueueService.getUserActiveLobby(userId);

        return reply.send({
          success: true,
          data: activeLobby,
        });
      } catch (error: any) {
        console.error("Get user active lobby error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to get active lobby",
        });
      }
    }
  );

  // Get lobby details
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: "Invalid lobby ID",
          });
        }

        const lobby = await QueueService.getLobby(id);

        return reply.send({
          success: true,
          data: lobby,
        });
      } catch (error: any) {
        console.error("Get lobby error:", error);
        return reply.status(404).send({
          success: false,
          message: error.message || "Lobby not found",
        });
      }
    }
  );

  // Mark player as ready
  fastify.post<{ Params: { id: string } }>(
    "/:id/ready",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = (request as AuthenticatedRequest).user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: "Invalid lobby ID",
          });
        }

        const result = await QueueService.markPlayerReady(id, userId);

        return reply.send({
          success: true,
          message: "Marked as ready",
          data: {
            lobby: result.lobby,
            allReady: result.allReady,
          },
        });
      } catch (error: any) {
        console.error("Mark ready error:", error);
        return reply.status(400).send({
          success: false,
          message: error.message || "Failed to mark as ready",
        });
      }
    }
  );

  // Leave lobby (cancels for everyone)
  fastify.post<{ Params: { id: string } }>(
    "/:id/leave",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: "Invalid lobby ID",
          });
        }

        const cancelled = await QueueService.cancelLobby(id);

        if (!cancelled) {
          return reply.status(404).send({
            success: false,
            message: "Lobby not found",
          });
        }

        return reply.send({
          success: true,
          message: "Left lobby successfully",
        });
      } catch (error: any) {
        console.error("Leave lobby error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to leave lobby",
        });
      }
    }
  );
};

export default lobbyRoutes;

