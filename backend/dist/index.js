"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_1 = __importDefault(require("./config/socket"));
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: true,
});
const PORT = process.env.PORT || 8000;
const socketManager = new socket_1.default();
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://e-sport-connection.vercel.app",
];
fastify.register(cors_1.default, {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});
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
fastify.get("/api/test-cors", async (request, reply) => {
    return {
        success: true,
        message: "CORS is working!",
        timestamp: new Date().toISOString(),
    };
});
fastify.get("/api/v1", async (request, reply) => {
    return { message: "E-Sport Connection API v1" };
});
async function registerRoutes() {
    try {
        console.log("🔧 Registering auth routes...");
        const authRoutes = await Promise.resolve().then(() => __importStar(require("./routes/authRoutes")));
        console.log("🔧 Auth routes imported:", !!authRoutes.default);
        fastify.register(authRoutes.default, { prefix: "/api/auth" });
        console.log("🔧 Auth routes registered with prefix /api/auth");
        console.log("🔧 Registering user routes...");
        const userRoutes = await Promise.resolve().then(() => __importStar(require("./routes/userRoutes")));
        console.log("🔧 User routes imported:", !!userRoutes.default);
        fastify.register(userRoutes.default, { prefix: "/api/users" });
        console.log("🔧 User routes registered with prefix /api/users");
        console.log("🔧 Registering player profile routes...");
        const playerProfileRoutes = await Promise.resolve().then(() => __importStar(require("./routes/playerProfileRoutes")));
        console.log("🔧 Player profile routes imported:", !!playerProfileRoutes.default);
        fastify.register(playerProfileRoutes.default, {
            prefix: "/api/player-profiles",
        });
        console.log("🔧 Player profile routes registered with prefix /api/player-profiles");
        console.log("🔧 Registering organization profile routes...");
        const organizationProfileRoutes = await Promise.resolve().then(() => __importStar(require("./routes/organizationProfileRoutes")));
        console.log("🔧 Organization profile routes imported:", !!organizationProfileRoutes.default);
        fastify.register(organizationProfileRoutes.default, {
            prefix: "/api/organization-profiles",
        });
        console.log("🔧 Organization profile routes registered with prefix /api/organization-profiles");
        console.log("🔧 Registering notification routes...");
        const notificationRoutes = await Promise.resolve().then(() => __importStar(require("./routes/notificationRoutes")));
        console.log("🔧 Notification routes imported:", !!notificationRoutes.default);
        fastify.register(notificationRoutes.default, { prefix: "/api" });
        console.log("🔧 Notification routes registered with prefix /api");
        console.log("🔧 Registering stats routes...");
        const statsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/statsRoutes")));
        console.log("🔧 Stats routes imported:", !!statsRoutes.default);
        fastify.register(statsRoutes.default, { prefix: "/api" });
        console.log("🔧 Stats routes registered with prefix /api");
        console.log("🔧 Registering test routes...");
        const testRoutes = await Promise.resolve().then(() => __importStar(require("./routes/testRoutes")));
        console.log("🔧 Test routes imported:", !!testRoutes.default);
        fastify.register(testRoutes.default, { prefix: "/api/test" });
        console.log("🔧 Test routes registered with prefix /api/test");
        console.log("🔧 Registering upload routes...");
        const uploadRoutes = await Promise.resolve().then(() => __importStar(require("./routes/uploadRoutes")));
        console.log("🔧 Upload routes imported:", !!uploadRoutes.default);
        fastify.register(uploadRoutes.default, { prefix: "/api/upload" });
        console.log("🔧 Upload routes registered with prefix /api/upload");
        console.log("🔧 Registering message routes...");
        const messageRoutes = await Promise.resolve().then(() => __importStar(require("./routes/messageRoutes")));
        console.log("🔧 Message routes imported:", !!messageRoutes.default);
        fastify.register(messageRoutes.default, { prefix: "/api" });
        console.log("🔧 Message routes registered with prefix /api");
        console.log("🔧 Registering news routes...");
        const newsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/newsRoutes")));
        console.log("🔧 News routes imported:", !!newsRoutes.default);
        fastify.register(newsRoutes.default, { prefix: "/api/news" });
        console.log("🔧 News routes registered with prefix /api/news");
        console.log("🔧 Registering tournament routes...");
        const tournamentRoutes = await Promise.resolve().then(() => __importStar(require("./routes/tournamentRoutes")));
        console.log("🔧 Tournament routes imported:", !!tournamentRoutes.default);
        fastify.register(tournamentRoutes.default, { prefix: "/api/tournaments" });
        console.log("🔧 Tournament routes registered with prefix /api/tournaments");
        console.log("🔧 Registering dashboard routes...");
        const dashboardRoutes = await Promise.resolve().then(() => __importStar(require("./routes/dashboardRoutes")));
        console.log("🔧 Dashboard routes imported:", !!dashboardRoutes.default);
        fastify.register(dashboardRoutes.default, { prefix: "/api/dashboard" });
        console.log("🔧 Dashboard routes registered with prefix /api/dashboard");
        console.log("✅ All routes registered successfully");
    }
    catch (error) {
        console.error("❌ Error registering routes:", error);
    }
}
fastify.setErrorHandler((error, request, reply) => {
    console.error("Error:", error);
    reply.status(500).send({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : error.message,
    });
});
fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
        error: "Not Found",
        message: `Route ${request.method} ${request.url} not found`,
    });
});
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
const startServer = async () => {
    try {
        console.log("🚀 Starting DEBUG-FREE server...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Port:", PORT);
        await connectDB();
        console.log("✅ Database connected successfully");
        await registerRoutes();
        await fastify.listen({
            port: Number(PORT),
            host: "0.0.0.0",
        });
        socketManager.initialize(fastify.server);
        console.log(`✅ HTTP Server with Socket.IO running on port ${PORT}`);
        console.log(`✅ DEBUG-FREE Server running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/health`);
        console.log(`🚀 API endpoint: http://localhost:${PORT}/api/v1`);
        console.log(`🔌 WebSocket endpoint: http://localhost:${PORT}`);
        console.log(`🎯 NO DEBUG DEPENDENCIES - ERROR ELIMINATED!`);
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        console.error("Stack trace:", error.stack);
        process.exit(1);
        await mongoose_1.default.disconnect();
    }
};
startServer();
