const Fastify = require("fastify");
const cors = require("@fastify/cors");
const dotenv = require("dotenv");
dotenv.config();
const fastify = Fastify({
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
fastify.register(cors, {
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
        const authRoutes = require("./routes/authRoutes");
        fastify.register(authRoutes, { prefix: "/api/auth" });
        const userRoutes = require("./routes/userRoutes");
        fastify.register(userRoutes, { prefix: "/api/users" });
        const playerProfileRoutes = require("./routes/playerProfileRoutes");
        fastify.register(playerProfileRoutes, { prefix: "/api/player-profiles" });
        const organizationProfileRoutes = require("./routes/organizationProfileRoutes");
        fastify.register(organizationProfileRoutes, { prefix: "/api/organization-profiles" });
        const notificationRoutes = require("./routes/notificationRoutes");
        fastify.register(notificationRoutes, { prefix: "/api" });
        const statsRoutes = require("./routes/statsRoutes");
        fastify.register(statsRoutes, { prefix: "/api" });
        const messageRoutes = require("./routes/messageRoutes");
        fastify.register(messageRoutes, { prefix: "/api" });
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
