import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, requireModerator, AuthenticatedRequest } from "../middleware/auth";
import MatchResult, { ResultStatus } from "../models/MatchResult";
import MatchLobby from "../models/MatchLobby";
import MatchResultService from "../services/matchResultService";

const moderatorRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all pending match results
  fastify.get(
    "/match-results/pending",
    { preHandler: [authenticateToken, requireModerator] },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const pendingResults = await MatchResult.find({
          status: ResultStatus.PENDING,
        })
          .populate("matchLobbyId")
          .populate("submittedBy", "name email")
          .sort({ submittedAt: -1 })
          .lean();

        // Enrich with lobby details (team info, map, etc.)
        const enrichedResults = await Promise.all(
          pendingResults.map(async (result: any) => {
            const lobby = await MatchLobby.findById(result.matchLobbyId._id || result.matchLobbyId)
              .populate("teamAlpha", "name inGameName")
              .populate("teamBravo", "name inGameName")
              .lean();

            return {
              ...result,
              lobby: lobby
                ? {
                    _id: lobby._id,
                    teamAlpha: lobby.teamAlpha,
                    teamBravo: lobby.teamBravo,
                    selectedMap: lobby.selectedMap,
                    players: lobby.players,
                  }
                : null,
            };
          })
        );

        // Always return success with empty array if no results
        return reply.send({
          success: true,
          data: enrichedResults || [],
        });
      } catch (error: any) {
        console.error("Error fetching pending results:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to fetch pending results",
        });
      }
    }
  );

  // Get all match results (pending, approved, rejected)
  fastify.get(
    "/match-results",
    { preHandler: [authenticateToken, requireModerator] },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { status, limit = 50, offset = 0 } = request.query as any;

        const query: any = {};
        if (status && Object.values(ResultStatus).includes(status)) {
          query.status = status;
        }

        const results = await MatchResult.find(query)
          .populate("matchLobbyId")
          .populate("submittedBy", "name email")
          .populate("reviewedBy", "name email")
          .sort({ submittedAt: -1 })
          .limit(parseInt(limit))
          .skip(parseInt(offset))
          .lean();

        // Enrich with lobby details
        const enrichedResults = await Promise.all(
          results.map(async (result: any) => {
            const lobby = await MatchLobby.findById(result.matchLobbyId._id || result.matchLobbyId)
              .populate("teamAlpha", "name inGameName")
              .populate("teamBravo", "name inGameName")
              .lean();

            return {
              ...result,
              lobby: lobby
                ? {
                    _id: lobby._id,
                    teamAlpha: lobby.teamAlpha,
                    teamBravo: lobby.teamBravo,
                    selectedMap: lobby.selectedMap,
                    players: lobby.players,
                  }
                : null,
            };
          })
        );

        const total = await MatchResult.countDocuments(query);

        return reply.send({
          success: true,
          data: enrichedResults,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        });
      } catch (error: any) {
        console.error("Error fetching results:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to fetch results",
        });
      }
    }
  );

  // Get specific match result by ID
  fastify.get(
    "/match-results/:resultId",
    { preHandler: [authenticateToken, requireModerator] },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { resultId } = request.params as { resultId: string };

        const result = await MatchResult.findById(resultId)
          .populate("matchLobbyId")
          .populate("submittedBy", "name email avatar")
          .populate("reviewedBy", "name email")
          .lean();

        if (!result) {
          return reply.status(404).send({
            success: false,
            message: "Match result not found",
          });
        }

        // Get lobby details
        const lobby = await MatchLobby.findById((result.matchLobbyId as any)._id || result.matchLobbyId)
          .populate("teamAlpha", "name inGameName")
          .populate("teamBravo", "name inGameName")
          .lean();

        return reply.send({
          success: true,
          data: {
            ...result,
            lobby: lobby
              ? {
                  _id: lobby._id,
                  teamAlpha: lobby.teamAlpha,
                  teamBravo: lobby.teamBravo,
                  selectedMap: lobby.selectedMap,
                  players: lobby.players,
                }
              : null,
          },
        });
      } catch (error: any) {
        console.error("Error fetching match result:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to fetch match result",
        });
      }
    }
  );

  // Approve match result with winner selection
  fastify.post(
    "/match-results/:resultId/approve",
    { preHandler: [authenticateToken, requireModerator] },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { resultId } = request.params as { resultId: string };
        const { winnerTeam, moderatorNotes } = request.body as {
          winnerTeam: "alpha" | "bravo";
          moderatorNotes?: string;
        };

        if (!winnerTeam || !["alpha", "bravo"].includes(winnerTeam)) {
          return reply.status(400).send({
            success: false,
            message: "winnerTeam must be 'alpha' or 'bravo'",
          });
        }

        const result = await MatchResultService.approveResult(
          resultId,
          winnerTeam,
          request.user!.id,
          moderatorNotes
        );

        return reply.send({
          success: true,
          message: "Match result approved successfully",
          data: result,
        });
      } catch (error: any) {
        console.error("Error approving match result:", error);
        return reply.status(400).send({
          success: false,
          message: error.message || "Failed to approve match result",
        });
      }
    }
  );

  // Reject/dispute match result
  fastify.post(
    "/match-results/:resultId/reject",
    { preHandler: [authenticateToken, requireModerator] },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { resultId } = request.params as { resultId: string };
        const { reviewNotes } = request.body as { reviewNotes?: string };

        const result = await MatchResultService.rejectResult(
          resultId,
          request.user!.id,
          reviewNotes
        );

        return reply.send({
          success: true,
          message: "Match result rejected successfully",
          data: result,
        });
      } catch (error: any) {
        console.error("Error rejecting match result:", error);
        return reply.status(400).send({
          success: false,
          message: error.message || "Failed to reject match result",
        });
      }
    }
  );
};

export default moderatorRoutes;

