import { FastifyInstance, FastifyPluginAsync } from "fastify";

const statsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/stats/health", async (request, reply) => {
    return {
      success: true,
      message: "Stats routes available",
      timestamp: new Date().toISOString(),
    };
  });
};

export default statsRoutes;