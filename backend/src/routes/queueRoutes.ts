import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { QueueService } from "../services/queueService";

const queueRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Join matchmaking queue
  fastify.post(
    "/join",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const { partyMembers } = request.body as {
          partyMembers?: string[];
        };

        const result = await QueueService.addToQueue(
          userId,
          partyMembers || []
        );

        return reply.send({
          success: true,
          message: "Successfully joined queue",
          data: result,
        });
      } catch (error: any) {
        console.error("Join queue error:", error);
        return reply.status(400).send({
          success: false,
          message: error.message || "Failed to join queue",
        });
      }
    }
  );

  // Leave matchmaking queue
  fastify.post(
    "/leave",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const removed = await QueueService.removeFromQueue(userId);

        return reply.send({
          success: true,
          message: removed
            ? "Successfully left queue"
            : "You were not in queue",
        });
      } catch (error: any) {
        console.error("Leave queue error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to leave queue",
        });
      }
    }
  );

  // Get queue status
  fastify.get(
    "/status",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const position = await QueueService.getQueuePosition(userId);
        const totalInQueue = await QueueService.getTotalInQueue();

        return reply.send({
          success: true,
          data: {
            inQueue: position > 0,
            position: position > 0 ? position : null,
            totalPlayers: totalInQueue,
          },
        });
      } catch (error: any) {
        console.error("Get queue status error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to get queue status",
        });
      }
    }
  );

  // Get all players in queue
  fastify.get(
    "/players",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const players = await QueueService.getQueuePlayers();

        return reply.send({
          success: true,
          data: players,
        });
      } catch (error: any) {
        console.error("Get queue players error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to get queue players",
        });
      }
    }
  );
};

export default queueRoutes;

