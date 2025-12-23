"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const queueService_1 = require("../services/queueService");
const queueRoutes = async (fastify) => {
    fastify.post("/join", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { partyMembers } = request.body;
            const result = await queueService_1.QueueService.addToQueue(userId, partyMembers || []);
            return reply.send({
                success: true,
                message: "Successfully joined queue",
                data: result,
            });
        }
        catch (error) {
            console.error("Join queue error:", error);
            return reply.status(400).send({
                success: false,
                message: error.message || "Failed to join queue",
            });
        }
    });
    fastify.post("/leave", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const removed = await queueService_1.QueueService.removeFromQueue(userId);
            return reply.send({
                success: true,
                message: removed
                    ? "Successfully left queue"
                    : "You were not in queue",
            });
        }
        catch (error) {
            console.error("Leave queue error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to leave queue",
            });
        }
    });
    fastify.get("/status", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const position = await queueService_1.QueueService.getQueuePosition(userId);
            const totalInQueue = await queueService_1.QueueService.getTotalInQueue();
            return reply.send({
                success: true,
                data: {
                    inQueue: position > 0,
                    position: position > 0 ? position : null,
                    totalPlayers: totalInQueue,
                },
            });
        }
        catch (error) {
            console.error("Get queue status error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to get queue status",
            });
        }
    });
    fastify.get("/players", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const players = await queueService_1.QueueService.getQueuePlayers();
            return reply.send({
                success: true,
                data: players,
            });
        }
        catch (error) {
            console.error("Get queue players error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to get queue players",
            });
        }
    });
};
exports.default = queueRoutes;
