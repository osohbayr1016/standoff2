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

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true,
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

    await mongoose.connect(mongoURI);
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

// Enable response compression (gzip/brotli) and ETag for caching
fastify.register(compress, {
  global: true,
  encodings: ["gzip", "deflate", "br"],
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
    const lobbyRoutes = await import("./routes/lobbyRoutes");
    fastify.register(lobbyRoutes.default, { prefix: "/api/lobby" });
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
    // Register routes
    await registerRoutes();

    // Listen on the specified port
    await fastify.listen({
      port: Number(PORT),
      host: "0.0.0.0", // Important for Render deployment
    });

    // Initialize Socket.IO after Fastify starts
    socketManager.initialize(fastify.server);

    // Start Match Deadline Checker
    MatchDeadlineChecker.start();
    console.log("✅ Match deadline checker started");

    // Start Queue Matcher - runs every 2 seconds
    setInterval(async () => {
      try {
        const lobbyId = await QueueService.findMatch();
        if (lobbyId) {
          console.log(`✅ Match found! Lobby created: ${lobbyId}`);
          
          // Get lobby details
          const lobby = await QueueService.getLobby(lobbyId);
          
          // Notify all players via Socket.IO
          const playerIds = lobby.players.map((p: any) => p.userId.toString());
          socketManager.notifyLobbyFound(playerIds, {
            lobbyId,
            players: lobby.players,
            teamAlpha: lobby.teamAlpha,
            teamBravo: lobby.teamBravo,
          });

          // Update queue count for remaining players
          const totalInQueue = await QueueService.getTotalInQueue();
          console.log(`📊 Broadcasting queue update: ${totalInQueue} players remaining`);
          socketManager.broadcastQueueUpdate(totalInQueue);
        }
      } catch (error) {
        console.error("Error in queue matcher:", error);
      }
    }, 2000);
    console.log("✅ Queue matcher started (checking every 2 seconds)");

    // Broadcast queue count to all listeners every 5 seconds
    setInterval(async () => {
      try {
        const totalInQueue = await QueueService.getTotalInQueue();
        socketManager.broadcastQueueUpdate(totalInQueue);
      } catch (error) {
        console.error("Error broadcasting queue count:", error);
      }
    }, 5000);
    console.log("✅ Queue count broadcaster started (every 5 seconds)");

    // Clean up expired lobbies every minute
    setInterval(async () => {
      try {
        await QueueService.cleanupExpiredLobbies();
      } catch (error) {
        console.error("Error cleaning up expired lobbies:", error);
      }
    }, 60000);
    console.log("✅ Lobby cleanup started (checking every minute)");
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
    await mongoose.disconnect();
  }
};

startServer();
