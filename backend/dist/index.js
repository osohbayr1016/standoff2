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
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: true
});
const PORT = process.env.PORT || 8000;
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
        const authRoutes = await Promise.resolve().then(() => __importStar(require("./routes/authRoutes")));
        fastify.register(authRoutes.default, { prefix: "/api/auth" });
        const userRoutes = await Promise.resolve().then(() => __importStar(require("./routes/userRoutes")));
        fastify.register(userRoutes.default, { prefix: "/api/users" });
        const playerProfileRoutes = await Promise.resolve().then(() => __importStar(require("./routes/playerProfileRoutes")));
        fastify.register(playerProfileRoutes.default, { prefix: "/api/player-profiles" });
        const organizationProfileRoutes = await Promise.resolve().then(() => __importStar(require("./routes/organizationProfileRoutes")));
        fastify.register(organizationProfileRoutes.default, { prefix: "/api/organization-profiles" });
        const notificationRoutes = await Promise.resolve().then(() => __importStar(require("./routes/notificationRoutes")));
        fastify.register(notificationRoutes.default, { prefix: "/api" });
        const statsRoutes = await Promise.resolve().then(() => __importStar(require("./routes/statsRoutes")));
        fastify.register(statsRoutes.default, { prefix: "/api" });
        const messageRoutes = await Promise.resolve().then(() => __importStar(require("./routes/messageRoutes")));
        fastify.register(messageRoutes.default, { prefix: "/api" });
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
        message: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message,
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
        await registerRoutes();
        await fastify.listen({
            port: Number(PORT),
            host: '0.0.0.0'
        });
        console.log(`✅ DEBUG-FREE Server running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/health`);
        console.log(`🚀 API endpoint: http://localhost:${PORT}/api/v1`);
        console.log(`🎯 NO DEBUG DEPENDENCIES - ERROR ELIMINATED!`);
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
};
startServer();
