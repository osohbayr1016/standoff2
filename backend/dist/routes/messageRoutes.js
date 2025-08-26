const { FastifyInstance, FastifyPluginAsync } = require("fastify");
const messageRoutes = async (fastify) => {
    fastify.get("/messages/health", async (request, reply) => {
        return {
            success: true,
            message: "Message routes available",
            timestamp: new Date().toISOString(),
        };
    });
};
module.exports = messageRoutes;
