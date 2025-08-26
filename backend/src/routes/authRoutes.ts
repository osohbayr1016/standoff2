import { FastifyInstance, FastifyPluginAsync } from "fastify";

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check for auth
  fastify.get("/health", async (request, reply) => {
    return {
      success: true,
      message: "Auth routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Placeholder login endpoint
  fastify.post("/login", async (request, reply) => {
    return {
      success: false,
      message: "Authentication temporarily disabled - debug elimination in progress",
    };
  });

  // Placeholder register endpoint
  fastify.post("/register", async (request, reply) => {
    return {
      success: false,
      message: "Registration temporarily disabled - debug elimination in progress",
    };
  });
};

export default authRoutes;