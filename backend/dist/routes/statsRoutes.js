"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statsRoutes = async (fastify) => {
    fastify.get("/stats/health", async (request, reply) => {
        return {
            success: true,
            message: "Stats routes available",
            timestamp: new Date().toISOString(),
        };
    });
};
exports.default = statsRoutes;
