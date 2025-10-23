import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { MatchService } from "../services/matchService";
import { MatchService2 } from "../services/matchService2";
import { MatchService3 } from "../services/matchService3";
import { MatchService4 } from "../services/matchService4";
import { MatchResult } from "../models/Match";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const matchActionRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Accept хийх
  fastify.post("/:id/accept", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const match = await MatchService.acceptMatch(id, request.user.id);

      return reply.send({ success: true, data: match });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // Тоглолт эхлүүлэх
  fastify.post("/:id/start", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const match = await MatchService2.startMatch(id, request.user.id);

      return reply.send({ success: true, data: match });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // Үр дүн оруулах
  fastify.post("/:id/result", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const { result } = request.body as any;

      console.log(`Result submission attempt: matchId=${id}, userId=${request.user.id}, result=${result}`);

      if (
        !result ||
        (result !== MatchResult.WIN && result !== MatchResult.LOSS)
      ) {
        console.log(`Invalid result: ${result}`);
        return reply
          .status(400)
          .send({ success: false, message: "Буруу үр дүн" });
      }

      const match = await MatchService2.submitResult(
        id,
        request.user.id,
        result
      );

      console.log(`Result submitted successfully for match ${id}`);
      return reply.send({ success: true, data: match });
    } catch (error: any) {
      console.log(`Error submitting result: ${error.message}`);
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // Dispute үүсгэх
  fastify.post("/:id/dispute", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const { images, description } = request.body as any;

      console.log(`🚨 Dispute creation request: matchId=${id}, userId=${request.user.id}`);
      console.log(`📊 Request body:`, { images, description });
      console.log(`📊 Images length: ${images ? images.length : 0}`);
      console.log(`📊 Description: "${description}"`);

      // Validation
      if (images && images.length > 2) {
        console.log(`❌ Too many images: ${images.length}`);
        return reply
          .status(400)
          .send({ success: false, message: "Дээд тал нь 2 зураг" });
      }

      const evidence = {
        images: images || [],
        description: description || undefined,
      };

      console.log(`📊 Evidence object:`, evidence);

      const match = await MatchService3.createDispute(id, request.user.id, evidence);

      console.log(`✅ Dispute created successfully`);
      return reply.send({ success: true, data: match });
    } catch (error: any) {
      console.error(`❌ Dispute creation failed:`, error.message);
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // Цуцлах
  fastify.post("/:id/cancel", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const match = await MatchService4.cancelMatch(id, request.user.id);

      return reply.send({ success: true, data: match });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // Chat харах
  fastify.get("/:id/chat", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const messages = await MatchService4.getChatMessages(id, request.user.id);

      return reply.send({ success: true, data: messages });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });

  // Chat илгээх
  fastify.post("/:id/chat", { preHandler: authenticateToken }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const { message } = request.body as any;

      if (!message || message.trim().length === 0) {
        return reply
          .status(400)
          .send({ success: false, message: "Мессеж хоосон байна" });
      }

      const chatMessage = await MatchService4.sendChatMessage(
        id,
        request.user.id,
        message
      );

      return reply.status(201).send({ success: true, data: chatMessage });
    } catch (error: any) {
      return reply.status(400).send({ success: false, message: error.message });
    }
  });
};

export default matchActionRoutes;
