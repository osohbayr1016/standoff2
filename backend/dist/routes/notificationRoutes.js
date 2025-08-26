"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notificationRoutes = async (fastify) => {
    fastify.get("/notifications/health", async (request, reply) => {
        return {
            success: true,
            message: "Notification routes available",
            timestamp: new Date().toISOString(),
        };
    });
};
exports.default = notificationRoutes;
