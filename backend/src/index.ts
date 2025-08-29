import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import SocketManager from "./config/socket";

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
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

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

// API v1 endpoint
fastify.get("/api/v1", async (request, reply) => {
  return { message: "E-Sport Connection API v1" };
});

// Import and register route handlers
async function registerRoutes() {
  try {
    // Auth routes
    console.log("🔧 Registering auth routes...");
    const authRoutes = await import("./routes/authRoutes");
    console.log("🔧 Auth routes imported:", !!authRoutes.default);
    fastify.register(authRoutes.default, { prefix: "/api/auth" });
    console.log("🔧 Auth routes registered with prefix /api/auth");

    // User routes
    console.log("🔧 Registering user routes...");
    const userRoutes = await import("./routes/userRoutes");
    console.log("🔧 User routes imported:", !!userRoutes.default);
    fastify.register(userRoutes.default, { prefix: "/api/users" });
    console.log("🔧 User routes registered with prefix /api/users");

    // Player profile routes
    console.log("🔧 Registering player profile routes...");
    const playerProfileRoutes = await import("./routes/playerProfileRoutes");
    console.log(
      "🔧 Player profile routes imported:",
      !!playerProfileRoutes.default
    );
    fastify.register(playerProfileRoutes.default, {
      prefix: "/api/player-profiles",
    });
    console.log(
      "🔧 Player profile routes registered with prefix /api/player-profiles"
    );

    // Organization profile routes
    console.log("🔧 Registering organization profile routes...");
    const organizationProfileRoutes = await import(
      "./routes/organizationProfileRoutes"
    );
    console.log(
      "🔧 Organization profile routes imported:",
      !!organizationProfileRoutes.default
    );
    fastify.register(organizationProfileRoutes.default, {
      prefix: "/api/organization-profiles",
    });
    console.log(
      "🔧 Organization profile routes registered with prefix /api/organization-profiles"
    );

    // Notification routes
    console.log("🔧 Registering notification routes...");
    const notificationRoutes = await import("./routes/notificationRoutes");
    console.log(
      "🔧 Notification routes imported:",
      !!notificationRoutes.default
    );
    fastify.register(notificationRoutes.default, { prefix: "/api" });
    console.log("🔧 Notification routes registered with prefix /api");

    // Stats routes
    console.log("🔧 Registering stats routes...");
    const statsRoutes = await import("./routes/statsRoutes");
    console.log("🔧 Stats routes imported:", !!statsRoutes.default);
    fastify.register(statsRoutes.default, { prefix: "/api" });
    console.log("🔧 Stats routes registered with prefix /api");

    // Test routes
    console.log("🔧 Registering test routes...");
    const testRoutes = await import("./routes/testRoutes");
    console.log("🔧 Test routes imported:", !!testRoutes.default);
    fastify.register(testRoutes.default, { prefix: "/api/test" });
    console.log("🔧 Test routes registered with prefix /api/test");

    // Upload routes - temporarily disabled due to Cloudinary issues
    // console.log("🔧 Registering upload routes...");
    // const uploadRoutes = await import("./routes/uploadRoutes");
    // console.log("🔧 Upload routes imported:", !!uploadRoutes.default);
    // fastify.register(uploadRoutes.default, { prefix: "/api/upload" });
    // console.log("🔧 Upload routes registered with prefix /api/upload");

    // Message routes
    console.log("🔧 Registering message routes...");
    const messageRoutes = await import("./routes/messageRoutes");
    console.log("🔧 Message routes imported:", !!messageRoutes.default);
    fastify.register(messageRoutes.default, { prefix: "/api" });
    console.log("🔧 Message routes registered with prefix /api");

    // News routes
    console.log("🔧 Registering news routes...");
    const newsRoutes = await import("./routes/newsRoutes");
    console.log("🔧 News routes imported:", !!newsRoutes.default);
    fastify.register(newsRoutes.default, { prefix: "/api/news" });
    console.log("🔧 News routes registered with prefix /api/news");

    // Tournament routes
    console.log("🔧 Registering tournament routes...");
    const tournamentRoutes = await import("./routes/tournamentRoutes");
    console.log("🔧 Tournament routes imported:", !!tournamentRoutes.default);
    fastify.register(tournamentRoutes.default, { prefix: "/api/tournaments" });
    console.log("🔧 Tournament routes registered with prefix /api/tournaments");

    // Squad routes
    console.log("🔧 Registering squad routes...");
    const squadRoutes = await import("./routes/squadRoutes");
    console.log("🔧 Squad routes imported:", !!squadRoutes.default);
    fastify.register(squadRoutes.default, { prefix: "/api/squads" });
    console.log("🔧 Squad routes registered with prefix /api/squads");

    // Tournament registration routes
    console.log("🔧 Registering tournament registration routes...");
    const tournamentRegistrationRoutes = await import(
      "./routes/tournamentRegistrationRoutes"
    );
    console.log(
      "🔧 Tournament registration routes imported:",
      !!tournamentRegistrationRoutes.default
    );
    fastify.register(tournamentRegistrationRoutes.default, {
      prefix: "/api/tournament-registrations",
    });
    console.log(
      "🔧 Tournament registration routes registered with prefix /api/tournament-registrations"
    );

    // Tournament match routes
    console.log("🔧 Registering tournament match routes...");
    const tournamentMatchRoutes = await import(
      "./routes/tournamentMatchRoutes"
    );
    console.log(
      "🔧 Tournament match routes imported:",
      !!tournamentMatchRoutes.default
    );
    fastify.register(tournamentMatchRoutes.default, {
      prefix: "/api/tournament-matches",
    });
    console.log(
      "🔧 Tournament match routes registered with prefix /api/tournament-matches"
    );

    // Dashboard routes
    console.log("🔧 Registering dashboard routes...");
    const dashboardRoutes = await import("./routes/dashboardRoutes");
    console.log("🔧 Dashboard routes imported:", !!dashboardRoutes.default);
    fastify.register(dashboardRoutes.default, { prefix: "/api/dashboard" });
    console.log("🔧 Dashboard routes registered with prefix /api/dashboard");

    // Pro player routes
    console.log("🔧 Registering pro player routes...");
    const proPlayerRoutes = await import("./routes/proPlayerRoutes");
    console.log("🔧 Pro player routes imported:", !!proPlayerRoutes.default);
    fastify.register(proPlayerRoutes.default, { prefix: "/api/pro-players" });
    console.log("🔧 Pro player routes registered with prefix /api/pro-players");

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

    // Connect to database first
    await connectDB();
    console.log("✅ Database connected successfully");

    // Register routes
    await registerRoutes();

    // Listen on the specified port
    await fastify.listen({
      port: Number(PORT),
      host: "0.0.0.0", // Important for Render deployment
    });

    // Initialize Socket.IO after Fastify starts
    socketManager.initialize(fastify.server);
    console.log(`✅ HTTP Server with Socket.IO running on port ${PORT}`);

    console.log(`✅ DEBUG-FREE Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🚀 API endpoint: http://localhost:${PORT}/api/v1`);
    console.log(`🔌 WebSocket endpoint: http://localhost:${PORT}`);
    console.log(`🎯 NO DEBUG DEPENDENCIES - ERROR ELIMINATED!`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
    await mongoose.disconnect();
  }
};

startServer();
