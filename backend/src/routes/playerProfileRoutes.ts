import { FastifyInstance, FastifyPluginAsync } from "fastify";

const playerProfileRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return {
      success: true,
      message: "Player profile routes available",
      timestamp: new Date().toISOString(),
    };
  });
};

export default playerProfileRoutes;