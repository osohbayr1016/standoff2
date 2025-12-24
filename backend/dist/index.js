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
const compress_1 = __importDefault(require("@fastify/compress"));
const etag_1 = __importDefault(require("@fastify/etag"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_1 = __importDefault(require("./config/socket"));
const queueService_1 = require("./services/queueService");
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: false,
    requestTimeout: 30000,
    bodyLimit: 10485760,
    maxParamLength: 100,
    disableRequestLogging: true,
    ignoreTrailingSlash: true,
    caseSensitive: true,
});
const PORT = process.env.PORT || 8000;
const socketManager = new socket_1.default();
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI, {
            maxPoolSize: 5,
            minPoolSize: 1,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            maxIdleTimeMS: 30000,
        });
        mongoose_1.default.set('bufferCommands', false);
        mongoose_1.default.set('autoIndex', false);
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};
fastify.register(cors_1.default, {
    origin: true,
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
fastify.register(compress_1.default, {
    global: false,
    encodings: ["gzip"],
    threshold: 1024,
});
fastify.register(etag_1.default);
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
fastify.get("/api/upload-test", async (request, reply) => {
    return {
        success: true,
        message: "Upload test endpoint working",
        timestamp: new Date().toISOString(),
    };
});
fastify.get("/api/v1", async (request, reply) => {
    return { message: "E-Sport Connection API v1" };
});
async function registerRoutes() {
    try {
        const { setupRateLimiting } = await Promise.resolve().then(() => __importStar(require("./config/rateLimit")));
        await setupRateLimiting(fastify);
        const authRoutes = await Promise.resolve().then(() => __importStar(require("./routes/authRoutes")));
        fastify.register(authRoutes.default, { prefix: "/api/auth" });
        const userRoutes = await Promise.resolve().then(() => __importStar(require("./routes/userRoutes")));
        fastify.register(userRoutes.default, { prefix: "/api/users" });
        const playerProfileRoutes = await Promise.resolve().then(() => __importStar(require("./routes/playerProfileRoutes")));
        fastify.register(playerProfileRoutes.default, {
            prefix: "/api/player-profiles",
        });
        try {
            const uploadRoutes = await Promise.resolve().then(() => __importStar(require("./routes/uploadRoutes")));
            if (uploadRoutes.default) {
                await fastify.register(uploadRoutes.default, { prefix: "/api/upload" });
            }
            else {
                console.error("❌ Upload routes default export is undefined");
            }
        }
        catch (error) {
            console.error("❌ Error registering upload routes:", error);
        }
        const settingsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/settingsRoutes")));
        fastify.register(settingsRoutes.default, { prefix: "/api/settings" });
        const matchRoutes = await Promise.resolve().then(() => __importStar(require("./routes/matchRoutes")));
        fastify.register(matchRoutes.default, { prefix: "/api/matches" });
        const matchActionRoutes = await Promise.resolve().then(() => __importStar(require("./routes/matchActionRoutes")));
        fastify.register(matchActionRoutes.default, {
            prefix: "/api/match-actions",
        });
        const friendRoutes = await Promise.resolve().then(() => __importStar(require("./routes/friendRoutes")));
        fastify.register(friendRoutes.default, { prefix: "/api/friends" });
        const queueRoutes = await Promise.resolve().then(() => __importStar(require("./routes/queueRoutes")));
        fastify.register(queueRoutes.default, { prefix: "/api/queue" });
        console.log("📋 Registering lobby routes module...");
        const lobbyRoutes = await Promise.resolve().then(() => __importStar(require("./routes/lobbyRoutes")));
        await fastify.register(lobbyRoutes.default, { prefix: "/api/lobby" });
        console.log("✅ Lobby routes module registered with prefix /api/lobby");
        const adminQueueRoutes = await Promise.resolve().then(() => __importStar(require("./routes/adminQueueRoutes")));
        fastify.register(adminQueueRoutes.default, { prefix: "/api/admin/queue" });
        const matchResultRoutes = await Promise.resolve().then(() => __importStar(require("./routes/matchResultRoutes")));
        fastify.register(matchResultRoutes.default, { prefix: "/api/match-results" });
        const mapBanRoutes = await Promise.resolve().then(() => __importStar(require("./routes/mapBanRoutes")));
        fastify.register(mapBanRoutes.default, { prefix: "/api/map-ban" });
        const moderatorRoutes = await Promise.resolve().then(() => __importStar(require("./routes/moderatorRoutes")));
        fastify.register(moderatorRoutes.default, { prefix: "/api/moderator" });
        const verificationRoutes = await Promise.resolve().then(() => __importStar(require("./routes/verificationRoutes")));
        fastify.register(verificationRoutes.default, { prefix: "/api/verification" });
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
    await fastify.close();
    process.exit(0);
});
process.on("SIGINT", async () => {
    await fastify.close();
    process.exit(0);
});
const startServer = async () => {
    try {
        await connectDB();
        await registerRoutes();
        await fastify.listen({
            port: Number(PORT),
            host: "0.0.0.0",
        });
        socketManager.initialize(fastify.server);
        fastify.socketManager = socketManager;
        setInterval(async () => {
            try {
                await queueService_1.QueueService.cleanupExpiredLobbies();
                if (global.gc)
                    global.gc();
            }
            catch (error) {
            }
        }, 300000);
        setInterval(() => {
            const used = process.memoryUsage();
            if (used.heapUsed > 200 * 1024 * 1024) {
                if (global.gc) {
                    global.gc();
                    console.log('🧹 Memory cleanup triggered');
                }
            }
        }, 60000);
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        console.error("Stack trace:", error.stack);
        process.exit(1);
        await mongoose_1.default.disconnect();
    }
};
startServer();
