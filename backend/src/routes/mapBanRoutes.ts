import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { MapBanService } from "../services/mapBanService";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const mapBanRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get map ban status
  fastify.get(
    "/:lobbyId/status",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { lobbyId } = request.params as { lobbyId: string };
        const status = await MapBanService.getMapBanStatus(lobbyId);

        return reply.send({
          success: true,
          data: status,
        });
      } catch (error: any) {
        console.error("Get map ban status error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to get map ban status",
        });
      }
    }
  );

  // Ban a map
  fastify.post(
    "/:lobbyId/ban",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const { lobbyId } = request.params as { lobbyId: string };
        const { mapName } = request.body as { mapName: string };

        if (!mapName) {
          return reply.status(400).send({
            success: false,
            message: "Map name is required",
          });
        }

        const lobby = await MapBanService.banMap(lobbyId, userId, mapName);

        return reply.send({
          success: true,
          message: "Map banned successfully",
          data: {
            availableMaps: lobby.availableMaps,
            bannedMaps: lobby.bannedMaps,
            selectedMap: lobby.selectedMap,
            currentBanTeam: lobby.currentBanTeam,
            mapBanPhase: lobby.mapBanPhase,
          },
        });
      } catch (error: any) {
        console.error("Ban map error:", error);
        return reply.status(400).send({
          success: false,
          message: error.message || "Failed to ban map",
        });
      }
    }
  );

  // Get team leaders
  fastify.get(
    "/:lobbyId/leaders",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { lobbyId } = request.params as { lobbyId: string };
        const status = await MapBanService.getMapBanStatus(lobbyId);

        return reply.send({
          success: true,
          data: {
            teamAlphaLeader: status.teamAlphaLeader,
            teamBravoLeader: status.teamBravoLeader,
            currentBanTeam: status.currentBanTeam,
          },
        });
      } catch (error: any) {
        console.error("Get leaders error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to get team leaders",
        });
      }
    }
  );
};

export default mapBanRoutes;

