const { FastifyInstance, FastifyPluginAsync } = require("fastify");
const authRoutes = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        return {
            success: true,
            message: "Auth routes available",
            timestamp: new Date().toISOString(),
        };
    });
    fastify.post("/login", async (request, reply) => {
        return {
            success: false,
            message: "Authentication temporarily disabled - debug elimination in progress",
        };
    });
    fastify.post("/register", async (request, reply) => {
        return {
            success: false,
            message: "Registration temporarily disabled - debug elimination in progress",
        };
    });
};
module.exports = authRoutes;
