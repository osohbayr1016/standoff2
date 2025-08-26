import { FastifyInstance, FastifyPluginAsync } from "fastify";

const notificationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/notifications/health", async (request, reply) => {
    return {
      success: true,
      message: "Notification routes available",
      timestamp: new Date().toISOString(),
    };
  });
};

export default notificationRoutes;