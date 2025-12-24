import Fastify from "fastify";
import compress from "@fastify/compress";
import etag from "@fastify/etag";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import SocketManager from "./config/socket";
import { MatchDeadlineChecker } from "./services/matchDeadlineChecker";
import { QueueService } from "./services/queueService";
import verificationRoutes from "./routes/verificationRoutes";

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: false, // Always disabled to save memory
  requestTimeout: 30000,
  bodyLimit: 10485760, // 10MB limit for image uploads
  maxParamLength: 100,
  disableRequestLogging: true,
  ignoreTrailingSlash: true,
  caseSensitive: true,
});

const PORT = process.env.PORT || 8000;

// Initialize Socket.IO (will be initialized after Fastify starts)
const socketManager = new SocketManager();

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: 5, // Reduced from 10
      minPoolSize: 1,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      maxIdleTimeMS: 30000,
    });

    // Optimize mongoose for memory
    mongoose.set('bufferCommands', false);
    mongoose.set('autoIndex', false);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// CORS configuration - Allow all origins for production flexibility
fastify.register(cors, {
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
});

// Enable lightweight compression (gzip only to save memory)
fastify.register(compress, {
  global: false, // Only compress when explicitly needed
  encodings: ["gzip"],
  threshold: 1024, // Only compress responses > 1KB
});
fastify.register(etag);

// Register rate limiting will be done in registerRoutes function

// Session removed for debug-free simplicity

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  return {
    status: "OK",
    message: "E-Sport Connection API is running",
    timestamp: new Date().toISOString(),
    websocket: {
      connectedUsers: socketManager.getConnectedUsersCount(),
      onlineUsers: socketManager.getOnlineUsers(),
    },
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

// Test upload endpoint
fastify.get("/api/upload-test", async (request, reply) => {
  return {
    success: true,
    message: "Upload test endpoint working",
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
    // Register rate limiting first
    const { setupRateLimiting } = await import("./config/rateLimit");
    await setupRateLimiting(fastify);

    // Verification routes (static import for maximum reliability)
    fastify.register(verificationRoutes, { prefix: "/api/verification" });
    // Auth routes
    const authRoutes = await import("./routes/authRoutes");
    fastify.register(authRoutes.default, { prefix: "/api/auth" });
    // User routes
    const userRoutes = await import("./routes/userRoutes");
    fastify.register(userRoutes.default, { prefix: "/api/users" });
    // Player profile routes
    const playerProfileRoutes = await import("./routes/playerProfileRoutes");
    fastify.register(playerProfileRoutes.default, {
      prefix: "/api/player-profiles",
    });
    // Upload routes - Direct registration to avoid import issues
    try {
      const uploadRoutes = await import("./routes/uploadRoutes");
      if (uploadRoutes.default) {
        await fastify.register(uploadRoutes.default, { prefix: "/api/upload" });
      } else {
        console.error("❌ Upload routes default export is undefined");
      }
    } catch (error) {
      console.error("❌ Error registering upload routes:", error);
      // Continue without upload routes
    }

    // Settings routes
    const settingsRoutes = await import("./routes/settingsRoutes");
    fastify.register(settingsRoutes.default, { prefix: "/api/settings" });
    // Match routes
    const matchRoutes = await import("./routes/matchRoutes");
    fastify.register(matchRoutes.default, { prefix: "/api/matches" });
    // Match action routes
    const matchActionRoutes = await import("./routes/matchActionRoutes");
    fastify.register(matchActionRoutes.default, {
      prefix: "/api/match-actions",
    });
    // Friend routes
    const friendRoutes = await import("./routes/friendRoutes");
    fastify.register(friendRoutes.default, { prefix: "/api/friends" });
    // Queue routes
    const queueRoutes = await import("./routes/queueRoutes");
    fastify.register(queueRoutes.default, { prefix: "/api/queue" });
    // Lobby routes
    console.log("📋 Registering lobby routes module...");
    const lobbyRoutes = await import("./routes/lobbyRoutes");
    await fastify.register(lobbyRoutes.default, { prefix: "/api/lobby" });
    console.log("✅ Lobby routes module registered with prefix /api/lobby");
    // Admin queue routes
    const adminQueueRoutes = await import("./routes/adminQueueRoutes");
    fastify.register(adminQueueRoutes.default, { prefix: "/api/admin/queue" });
    // Match result routes
    const matchResultRoutes = await import("./routes/matchResultRoutes");
    fastify.register(matchResultRoutes.default, { prefix: "/api/match-results" });
    // Map ban routes
    const mapBanRoutes = await import("./routes/mapBanRoutes");
    fastify.register(mapBanRoutes.default, { prefix: "/api/map-ban" });
    // Moderator routes
    const moderatorRoutes = await import("./routes/moderatorRoutes");
    fastify.register(moderatorRoutes.default, { prefix: "/api/moderator" });
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
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
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
  await fastify.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await fastify.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Attached socketManager to fastify instance for use in routes
    (fastify as any).socketManager = socketManager;

    // Register routes
    await registerRoutes();

    // Listen on the specified port
    await fastify.listen({
      port: Number(PORT),
      host: "0.0.0.0", // Important for Render deployment
    });

    // Initialize Socket.IO after Fastify starts
    socketManager.initialize(fastify.server);

    // Clean up expired lobbies every 5 minutes
    setInterval(async () => {
      try {
        await QueueService.cleanupExpiredLobbies();
        if (global.gc) global.gc(); // Force garbage collection if available
      } catch (error) {
        // Silent fail
      }
    }, 300000);

    // Memory monitoring and cleanup every minute
    setInterval(() => {
      const used = process.memoryUsage();
      if (used.heapUsed > 200 * 1024 * 1024) { // If over 200MB
        if (global.gc) {
          global.gc();
          console.log('🧹 Memory cleanup triggered');
        }
      }
    }, 60000);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
    await mongoose.disconnect();
  }
};

startServer();

