"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const queueService_1 = require("../services/queueService");
const mongoose_1 = __importDefault(require("mongoose"));
const lobbyRoutes = async (fastify) => {
    fastify.get("/:id", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid lobby ID",
                });
            }
            const lobby = await queueService_1.QueueService.getLobby(id);
            return reply.send({
                success: true,
                data: lobby,
            });
        }
        catch (error) {
            console.error("Get lobby error:", error);
            return reply.status(404).send({
                success: false,
                message: error.message || "Lobby not found",
            });
        }
    });
    fastify.post("/:id/ready", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid lobby ID",
                });
            }
            const result = await queueService_1.QueueService.markPlayerReady(id, userId);
            return reply.send({
                success: true,
                message: "Marked as ready",
                data: {
                    lobby: result.lobby,
                    allReady: result.allReady,
                },
            });
        }
        catch (error) {
            console.error("Mark ready error:", error);
            return reply.status(400).send({
                success: false,
                message: error.message || "Failed to mark as ready",
            });
        }
    });
    fastify.post("/:id/leave", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid lobby ID",
                });
            }
            const cancelled = await queueService_1.QueueService.cancelLobby(id);
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
        }
        catch (error) {
            console.error("Leave lobby error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to leave lobby",
            });
        }
    });
};
exports.default = lobbyRoutes;
