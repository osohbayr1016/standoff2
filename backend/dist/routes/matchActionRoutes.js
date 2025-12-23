"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchService_1 = require("../services/matchService");
const matchService2_1 = require("../services/matchService2");
const matchService3_1 = require("../services/matchService3");
const matchService4_1 = require("../services/matchService4");
const Match_1 = require("../models/Match");
const auth_1 = require("../middleware/auth");
const matchActionRoutes = async (fastify) => {
    fastify.post("/:id/accept", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const match = await matchService_1.MatchService.acceptMatch(id, request.user.id);
            return reply.send({ success: true, data: match });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/start", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const match = await matchService2_1.MatchService2.startMatch(id, request.user.id);
            return reply.send({ success: true, data: match });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/result", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { result } = request.body;
            console.log(`Result submission attempt: matchId=${id}, userId=${request.user.id}, result=${result}`);
            if (!result ||
                (result !== Match_1.MatchResult.WIN && result !== Match_1.MatchResult.LOSS)) {
                console.log(`Invalid result: ${result}`);
                return reply
                    .status(400)
                    .send({ success: false, message: "Буруу үр дүн" });
            }
            const match = await matchService2_1.MatchService2.submitResult(id, request.user.id, result);
            console.log(`Result submitted successfully for match ${id}`);
            return reply.send({ success: true, data: match });
        }
        catch (error) {
            console.log(`Error submitting result: ${error.message}`);
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/dispute", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { images, description } = request.body;
            console.log(`🚨 Dispute creation request: matchId=${id}, userId=${request.user.id}`);
            console.log(`📊 Request body:`, { images, description });
            console.log(`📊 Images length: ${images ? images.length : 0}`);
            console.log(`📊 Description: "${description}"`);
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
            const match = await matchService3_1.MatchService3.createDispute(id, request.user.id, evidence);
            console.log(`✅ Dispute created successfully`);
            return reply.send({ success: true, data: match });
        }
        catch (error) {
            console.error(`❌ Dispute creation failed:`, error.message);
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/cancel", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const match = await matchService4_1.MatchService4.cancelMatch(id, request.user.id);
            return reply.send({ success: true, data: match });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.get("/:id/chat", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const messages = await matchService4_1.MatchService4.getChatMessages(id, request.user.id);
            return reply.send({ success: true, data: messages });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/chat", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { message } = request.body;
            if (!message || message.trim().length === 0) {
                return reply
                    .status(400)
                    .send({ success: false, message: "Мессеж хоосон байна" });
            }
            const chatMessage = await matchService4_1.MatchService4.sendChatMessage(id, request.user.id, message);
            return reply.status(201).send({ success: true, data: chatMessage });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
};
exports.default = matchActionRoutes;
