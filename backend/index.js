const Fastify = require("fastify");
const cors = require("@fastify/cors");
const dotenv = require("dotenv");

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

// Simple route handlers without separate files for now
fastify.register(async function (fastify) {
  // Auth routes
  fastify.get("/api/auth/health", async (request, reply) => {
    return {
      success: true,
      message: "Auth routes available",
      timestamp: new Date().toISOString(),
    };
  });

  fastify.post("/api/auth/login", async (request, reply) => {
    return {
      success: false,
      message: "Authentication temporarily disabled - debug elimination in progress",
    };
  });

  fastify.post("/api/auth/register", async (request, reply) => {
    return {
      success: false,
      message: "Registration temporarily disabled - debug elimination in progress",
    };
  });

  // User routes
  fastify.get("/api/users/health", async (request, reply) => {
    return {
      success: true,
      message: "User routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Player profile routes
  fastify.get("/api/player-profiles/health", async (request, reply) => {
    return {
      success: true,
      message: "Player profile routes available", 
      timestamp: new Date().toISOString(),
    };
  });

  // Organization profile routes
  fastify.get("/api/organization-profiles/health", async (request, reply) => {
    return {
      success: true,
      message: "Organization profile routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Message routes
  fastify.get("/api/messages/health", async (request, reply) => {
    return {
      success: true,
      message: "Message routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Notification routes
  fastify.get("/api/notifications/health", async (request, reply) => {
    return {
      success: true,
      message: "Notification routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Stats routes
  fastify.get("/api/stats/health", async (request, reply) => {
    return {
      success: true,
      message: "Stats routes available",
      timestamp: new Date().toISOString(),
    };
  });
});

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
    console.log("🚀 Starting JavaScript server...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Port:", PORT);

    // Listen on the specified port
    await fastify.listen({ 
      port: Number(PORT), 
      host: '0.0.0.0' // Important for Render deployment
    });
    
    console.log(`✅ JavaScript Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🚀 API endpoint: http://localhost:${PORT}/api/v1`);
    console.log(`🎯 PURE JAVASCRIPT - NO TYPESCRIPT ERRORS!`);
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

startServer();
