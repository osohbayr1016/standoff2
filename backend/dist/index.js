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
fastify.register(compress_1.default, {
    global: true,
    encodings: ["gzip", "deflate", "br"],
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
        const organizationProfileRoutes = await Promise.resolve().then(() => __importStar(require("./routes/organizationProfileRoutes")));
        fastify.register(organizationProfileRoutes.default, {
            prefix: "/api/organization-profiles",
        });
        const notificationRoutes = await Promise.resolve().then(() => __importStar(require("./routes/notificationRoutes")));
        fastify.register(notificationRoutes.default, { prefix: "/api" });
        const statsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/statsRoutes")));
        fastify.register(statsRoutes.default, { prefix: "/api" });
        const testRoutes = await Promise.resolve().then(() => __importStar(require("./routes/testRoutes")));
        fastify.register(testRoutes.default, { prefix: "/api/test" });
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
        const messageRoutes = await Promise.resolve().then(() => __importStar(require("./routes/messageRoutes")));
        fastify.register(messageRoutes.default, { prefix: "/api" });
        const newsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/newsRoutes")));
        fastify.register(newsRoutes.default, { prefix: "/api/news" });
        const tournamentRoutes = await Promise.resolve().then(() => __importStar(require("./routes/tournamentRoutes")));
        fastify.register(tournamentRoutes.default, { prefix: "/api/tournaments" });
        const tournamentMatchRoutes = await Promise.resolve().then(() => __importStar(require("./routes/tournamentMatchRoutes")));
        fastify.register(tournamentMatchRoutes.default, {
            prefix: "/api/tournament-matches",
        });
        const bountyCoinRoutes = await Promise.resolve().then(() => __importStar(require("./routes/bountyCoinRoutes")));
        fastify.register(bountyCoinRoutes.default, {
            prefix: "/api/bounty-coins",
        });
        const squadRoutes = await Promise.resolve().then(() => __importStar(require("./routes/squadRoutes")));
        fastify.register(squadRoutes.default, { prefix: "/api/squads" });
        const divisionRoutes = await Promise.resolve().then(() => __importStar(require("./routes/divisionRoutes")));
        fastify.register(divisionRoutes.default, { prefix: "/api/divisions" });
        const tournamentRegistrationRoutes = await Promise.resolve().then(() => __importStar(require("./routes/tournamentRegistrationRoutes")));
        fastify.register(tournamentRegistrationRoutes.default, {
            prefix: "/api/tournament-registrations",
        });
        const dashboardRoutes = await Promise.resolve().then(() => __importStar(require("./routes/dashboardRoutes")));
        fastify.register(dashboardRoutes.default, { prefix: "/api/dashboard" });
        const proPlayerRoutes = await Promise.resolve().then(() => __importStar(require("./routes/proPlayerRoutes")));
        fastify.register(proPlayerRoutes.default, { prefix: "/api/pro-players" });
        const settingsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/settingsRoutes")));
        fastify.register(settingsRoutes.default, { prefix: "/api/settings" });
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
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        console.error("Stack trace:", error.stack);
        process.exit(1);
        await mongoose_1.default.disconnect();
    }
};
startServer();
