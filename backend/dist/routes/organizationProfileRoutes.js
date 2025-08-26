"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const organizationProfileRoutes = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        return {
            success: true,
            message: "Organization profile routes available",
            timestamp: new Date().toISOString(),
        };
    });
};
exports.default = organizationProfileRoutes;
