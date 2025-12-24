import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { LobbyService } from "../services/lobbyService";
import mongoose from "mongoose";

const lobbyRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  console.log("📋 Registering lobby routes...");
  
  // Create a new lobby
  fastify.post(
    "/create",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const { map, link } = request.body as { map: string; link: string };

        if (!map || !link) {
          return reply.status(400).send({
            success: false,
            message: "Map and Link are required",
          });
        }

        const lobby = await LobbyService.createLobby(userId, map, link);

        return reply.send({
          success: true,
          data: lobby,
        });
      } catch (error: any) {
        console.error("Create lobby error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to create lobby",
        });
      }
    }
  );
  console.log("  ✅ POST /api/lobby/create registered");

  // Get active lobbies - MUST be before /:id route
  fastify.get(
    "/active",
    async (request, reply) => {
      try {
        const lobbies = await LobbyService.getActiveLobbies();
        return reply.send({
          success: true,
          data: lobbies,
        });
      } catch (error: any) {
        console.error("Get active lobbies error:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to get active lobbies",
        });
      }
    }
  );
  console.log("  ✅ GET /api/lobby/active registered (public)");

  // Get lobby details
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return reply.status(400).send({ success: false, message: "Invalid lobby ID" });
        }

        const lobby = await LobbyService.getLobby(id);
        if (!lobby) {
          return reply.status(404).send({ success: false, message: "Lobby not found" });
        }

        return reply.send({ success: true, data: lobby });
      } catch (error: any) {
        return reply.status(500).send({ success: false, message: error.message });
      }
    }
  );

  // Join lobby
  fastify.post<{ Params: { id: string } }>(
    "/:id/join",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = (request as AuthenticatedRequest).user.id;
        const lobby = await LobbyService.joinLobby(id, userId);
        return reply.send({ success: true, data: lobby });
      } catch (error: any) {
        return reply.status(400).send({ success: false, message: error.message });
      }
    }
  );

  // Select team
  fastify.post<{ Params: { id: string } }>(
    "/:id/team",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = (request as AuthenticatedRequest).user.id;
        const { team } = request.body as { team: "alpha" | "bravo" };
        const lobby = await LobbyService.selectTeam(id, userId, team);
        return reply.send({ success: true, data: lobby });
      } catch (error: any) {
        return reply.status(400).send({ success: false, message: error.message });
      }
    }
  );

  // Kick player
  fastify.post<{ Params: { id: string } }>(
    "/:id/kick",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const leaderId = (request as AuthenticatedRequest).user.id;
        const { targetUserId } = request.body as { targetUserId: string };
        const lobby = await LobbyService.kickPlayer(id, leaderId, targetUserId);
        return reply.send({ success: true, data: lobby });
      } catch (error: any) {
        return reply.status(400).send({ success: false, message: error.message });
      }
    }
  );

  // Leave lobby
  fastify.post<{ Params: { id: string } }>(
    "/:id/leave",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = (request as AuthenticatedRequest).user.id;
        await LobbyService.leaveLobby(id, userId);
        return reply.send({ success: true, message: "Left lobby successfully" });
      } catch (error: any) {
        return reply.status(500).send({ success: false, message: error.message });
      }
    }
  );
  
  console.log("✅ All lobby routes registered successfully");
};

export default lobbyRoutes;
