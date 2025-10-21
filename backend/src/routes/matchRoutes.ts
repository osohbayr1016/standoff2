import { FastifyInstance, FastifyPluginAsync } from "fastify";
import Match, { MatchStatus, MatchType, MatchResult } from "../models/Match";
import { MatchService } from "../services/matchService";
import { MatchService2 } from "../services/matchService2";
import { MatchService3 } from "../services/matchService3";
import { MatchService4 } from "../services/matchService4";
import Squad from "../models/Squad";

const matchRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Бүх идэвхтэй matches
  fastify.get("/", async (request, reply) => {
    try {
      const { type, status, limit = 20, page = 1 } = request.query as any;

      const query: any = {};

      if (type) {
        query.type = type;
      } else {
        query.$or = [
          { type: MatchType.PUBLIC },
          { type: MatchType.PRIVATE, status: { $ne: MatchStatus.PENDING } },
        ];
      }

      if (status) {
        query.status = status;
      } else {
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
  fastify.get("/my-squad", async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply
          .status(401)
          .send({ success: false, message: "Нэвтрэх шаардлагатай" });
      }

      const { status, limit = 20, page = 1 } = request.query as any;
      const squad = await Squad.findOne({ members: request.user.id });

      if (!squad) {
        return reply.send({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 },
        });
      }

      const query: any = {
        $or: [{ challengerSquadId: squad._id }, { opponentSquadId: squad._id }],
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
  fastify.post("/", async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply
          .status(401)
          .send({ success: false, message: "Нэвтрэх шаардлагатай" });
      }

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
