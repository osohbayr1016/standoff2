import { FastifyInstance, FastifyPluginAsync } from "fastify";

const messageRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/messages/health", async (request, reply) => {
    return {
      success: true,
      message: "Message routes available",
      timestamp: new Date().toISOString(),
    };
  });
};

export default messageRoutes;