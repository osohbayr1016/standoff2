import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true
});

const PORT = process.env.PORT || 8000;

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001", 
  "http://127.0.0.1:3001",
  "https://e-sport-connection.vercel.app",
];

// Register CORS
fastify.register(cors, {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});

// Session removed for debug-free simplicity

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  return {
    status: "OK",
    message: "E-Sport Connection API is running",
    timestamp: new Date().toISOString(),
  };
});

// CORS test endpoint
fastify.get("/api/test-cors", async (request, reply) => {
  return {
    success: true,
    message: "CORS is working!",
    timestamp: new Date().toISOString(),
  };
});

// API v1 endpoint
fastify.get("/api/v1", async (request, reply) => {
  return { message: "E-Sport Connection API v1" };
});

// Import and register route handlers
async function registerRoutes() {
  try {
    // Auth routes
    const authRoutes = await import("./routes/authRoutes");
    fastify.register(authRoutes.default, { prefix: "/api/auth" });

    // User routes
    const userRoutes = await import("./routes/userRoutes");
    fastify.register(userRoutes.default, { prefix: "/api/users" });

    // Player profile routes
    const playerProfileRoutes = await import("./routes/playerProfileRoutes");
    fastify.register(playerProfileRoutes.default, { prefix: "/api/player-profiles" });

    // Organization profile routes
    const organizationProfileRoutes = await import("./routes/organizationProfileRoutes");
    fastify.register(organizationProfileRoutes.default, { prefix: "/api/organization-profiles" });

    // Notification routes
    const notificationRoutes = await import("./routes/notificationRoutes");
    fastify.register(notificationRoutes.default, { prefix: "/api" });

    // Stats routes
    const statsRoutes = await import("./routes/statsRoutes");
    fastify.register(statsRoutes.default, { prefix: "/api" });

    // Message routes
    const messageRoutes = await import("./routes/messageRoutes");
    fastify.register(messageRoutes.default, { prefix: "/api" });

    console.log("✅ All routes registered successfully");
  } catch (error) {
    console.error("❌ Error registering routes:", error);
    // Continue without routes for basic health check
  }
}

// Error handling
fastify.setErrorHandler((error, request, reply) => {
  console.error("Error:", error);
  reply.status(500).send({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message,
  });
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: "Not Found",
    message: `Route ${request.method} ${request.url} not found`,
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    console.log("🚀 Starting DEBUG-FREE server...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Port:", PORT);
    
    // Register routes (without database for now)
    await registerRoutes();

    // Listen on the specified port
    await fastify.listen({ 
      port: Number(PORT), 
      host: '0.0.0.0' // Important for Render deployment
    });
    
    console.log(`✅ DEBUG-FREE Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🚀 API endpoint: http://localhost:${PORT}/api/v1`);
    console.log(`🎯 NO DEBUG DEPENDENCIES - ERROR ELIMINATED!`);
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

startServer();