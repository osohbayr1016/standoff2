// Type test file to verify Fastify types are working
import Fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";

// This should compile without errors if types are working
const testPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get("/test", async (request, reply) => {
    return { message: "Types are working!" };
  });
};

console.log("✅ Fastify types are working correctly!");
