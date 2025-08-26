"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messageRoutes = async (fastify) => {
    fastify.get("/messages/health", async (request, reply) => {
        return {
            success: true,
            message: "Message routes available",
            timestamp: new Date().toISOString(),
        };
    });
};
exports.default = messageRoutes;
