import { FastifyInstance, FastifyPluginAsync } from "fastify";
import Match, { MatchStatus, MatchType, MatchResult } from "../models/Match";
import { MatchService } from "../services/matchService";
import { MatchService2 } from "../services/matchService2";
import { MatchService3 } from "../services/matchService3";
import { MatchService4 } from "../services/matchService4";
import Squad from "../models/Squad";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const matchRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Бүх идэвхтэй matches
  fastify.get("/", async (request, reply) => {
    try {
      const { type, status, limit = 20, page = 1 } = request.query as any;

      const query: any = {};

      // Build type filter
      if (type) {
        query.type = type;
      } else {
        // Show all PUBLIC matches and PRIVATE matches that are not pending
        query.$or = [
          { type: MatchType.PUBLIC },
          { type: MatchType.PRIVATE, status: { $ne: MatchStatus.PENDING } },
        ];
      }

      // Build status filter
      if (status) {
        query.status = status;
      } else {
        // Only show active matches (not completed, cancelled, or disputed)
        query.status = {
          $in: [MatchStatus.PENDING, MatchStatus.ACCEPTED, MatchStatus.PLAYING],
        };
      }

      const skip = (page - 1) * limit;

      const matches = await Match.find(query)
        .populate("challengerSquadId", "name tag logo")
        .populate("opponentSquadId", "name tag logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Match.countDocuments(query);

      return reply.send({
        success: true,
        data: matches,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Миний squad-ийн matches
  fastify.get("/my-squad", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { status, limit = 20, page = 1 } = request.query as any;
      // Look for squads where user is a member (not just leader)
      const squads = await Squad.find({ members: request.user.id });

      if (!squads || squads.length === 0) {
        return reply.send({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 },
        });
      }

      const squadIds = squads.map(squad => squad._id);

      const query: any = {
        $or: [
          { challengerSquadId: { $in: squadIds } }, 
          { opponentSquadId: { $in: squadIds } }
        ],
      };

      if (status) query.status = status;

      const skip = (page - 1) * limit;
      const matches = await Match.find(query)
        .populate("challengerSquadId", "name tag logo")
        .populate("opponentSquadId", "name tag logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Match.countDocuments(query);

      return reply.send({
        success: true,
        data: matches,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Түүх
  fastify.get("/history", async (request, reply) => {
    try {
      const { limit = 20, page = 1, squadId } = request.query as any;

      const query: any = {
        status: { $in: [MatchStatus.COMPLETED, MatchStatus.CANCELLED] },
      };

      if (squadId) {
        query.$or = [
          { challengerSquadId: squadId },
          { opponentSquadId: squadId },
        ];
      }

      const skip = (page - 1) * limit;
      const matches = await Match.find(query)
        .populate("challengerSquadId", "name tag logo")
        .populate("opponentSquadId", "name tag logo")
        .populate("winnerId", "name tag logo")
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Match.countDocuments(query);

      return reply.send({
        success: true,
        data: matches,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Comprehensive match history (regular + tournament matches)
  fastify.get("/history/all", async (request, reply) => {
    try {
      const { limit = 20, page = 1, squadId } = request.query as any;

      if (!squadId) {
        return reply.status(400).send({ 
          success: false, 
          message: "Squad ID is required" 
        });
      }

      const skip = (page - 1) * limit;

      // Fetch completed regular matches (for statistics)
      const regularMatches = await Match.find({
        $or: [
          { challengerSquadId: squadId },
          { opponentSquadId: squadId },
        ],
        status: MatchStatus.COMPLETED,
      })
        .populate("challengerSquadId", "name tag logo")
        .populate("opponentSquadId", "name tag logo")
        .populate("winnerId", "name tag logo")
        .sort({ completedAt: -1 })
        .lean();

      // Fetch cancelled regular matches (for display only, not statistics)
      const cancelledMatches = await Match.find({
        $or: [
          { challengerSquadId: squadId },
          { opponentSquadId: squadId },
        ],
        status: MatchStatus.CANCELLED,
      })
        .populate("challengerSquadId", "name tag logo")
        .populate("opponentSquadId", "name tag logo")
        .populate("winnerId", "name tag logo")
        .sort({ completedAt: -1 })
        .lean();

      // Fetch tournament matches
      const TournamentMatch = (await import("../models/TournamentMatch")).default;
      const tournamentMatches = await TournamentMatch.find({
        $or: [
          { squad1: squadId },
          { squad2: squadId },
        ],
        status: "completed",
      })
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .populate("winner", "name tag logo")
        .populate("tournament", "name")
        .sort({ endTime: -1 })
        .lean();

      // Combine and format matches
      const allMatches = [
        // Completed regular matches (count in statistics)
        ...regularMatches.map(match => ({
          ...match,
          matchType: 'regular',
          opponentSquad: match.challengerSquadId._id.toString() === squadId 
            ? match.opponentSquadId 
            : match.challengerSquadId,
          isWinner: match.winnerId && match.winnerId._id.toString() === squadId,
          bountyAmount: match.bountyAmount || 0,
          completedAt: match.completedAt,
          status: 'completed',
        })),
        // Cancelled regular matches (display only, don't count in statistics)
        ...cancelledMatches.map(match => ({
          ...match,
          matchType: 'regular',
          opponentSquad: match.challengerSquadId._id.toString() === squadId 
            ? match.opponentSquadId 
            : match.challengerSquadId,
          isWinner: false, // Cancelled matches don't have winners
          bountyAmount: match.bountyAmount || 0,
          completedAt: match.completedAt,
          status: 'cancelled',
        })),
        // Tournament matches (count in statistics)
        ...tournamentMatches.map(match => ({
          ...match,
          matchType: 'tournament',
          opponentSquad: match.squad1._id.toString() === squadId 
            ? match.squad2 
            : match.squad1,
          isWinner: match.winner && match.winner._id.toString() === squadId,
          bountyAmount: match.bountyCoinAmount || 0,
          completedAt: match.endTime,
          status: 'completed',
        }))
      ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      // Apply pagination
      const paginatedMatches = allMatches.slice(skip, skip + limit);
      const total = allMatches.length;

      return reply.send({
        success: true,
        data: paginatedMatches,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Дэлгэрэнгүй
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as any;

      const match = await Match.findById(id)
        .populate("challengerSquadId")
        .populate("opponentSquadId")
        .populate("winnerId", "name tag logo")
        .populate("resolvedBy", "name email");

      if (!match) {
        return reply
          .status(404)
          .send({ success: false, message: "Match олдсонгүй" });
      }

      return reply.send({ success: true, data: match });
    } catch (error: any) {
      return reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Match үүсгэх
  fastify.post("/", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { type, opponentSquadId, bountyAmount, deadline } =
        request.body as any;

      const match = await MatchService.createMatch(
        request.user.id,
        type,
        opponentSquadId,
        bountyAmount,
        new Date(deadline)
      );

      return reply.status(201).send({ success: true, data: match });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });
};

export default matchRoutes;
