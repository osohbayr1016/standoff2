"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playerProfileRoutes = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        return {
            success: true,
            message: "Player profile routes available",
            timestamp: new Date().toISOString(),
        };
    });
};
exports.default = playerProfileRoutes;
