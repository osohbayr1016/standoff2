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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const passport_1 = __importDefault(require("./config/passport"));
const database_1 = require("./config/database");
const mongoose_1 = __importDefault(require("mongoose"));
const socket_1 = __importDefault(require("./config/socket"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 8000;
const socketManager = new socket_1.default(server);
app.use((0, helmet_1.default)());
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://e-sport-connection.vercel.app",
];
console.log("🔧 CORS Configuration:");
console.log("Allowed origins:", allowedOrigins);
console.log("Frontend URL from env:", process.env.FRONTEND_URL);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        console.log("🌐 CORS request from origin:", origin);
        if (!origin) {
            console.log("✅ Allowing request with no origin");
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log("✅ CORS allowed for origin:", origin);
            callback(null, true);
        }
        else {
            console.log("❌ CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.options("*", (0, cors_1.default)());
const sessionConfig = {
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
    },
};
if (process.env.NODE_ENV === "production") {
    console.log("🔐 Using production session configuration");
    console.log("⚠️  Warning: Using MemoryStore in production. Consider using Redis or MongoDB for session storage.");
}
else {
    console.log("🔐 Using development session configuration");
}
app.use((0, express_session_1.default)(sessionConfig));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "E-Sport Connection API is running",
        timestamp: new Date().toISOString(),
    });
});
app.get("/api/test-cors", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CORS is working!",
        timestamp: new Date().toISOString(),
    });
});
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const playerProfileRoutes_1 = __importDefault(require("./routes/playerProfileRoutes"));
const organizationProfileRoutes_1 = __importDefault(require("./routes/organizationProfileRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const faceitRoutes_1 = __importDefault(require("./routes/faceitRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const notificationService_1 = require("./utils/notificationService");
const faceitSyncService_1 = __importDefault(require("./utils/faceitSyncService"));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/player-profiles", playerProfileRoutes_1.default);
app.use("/api/organization-profiles", organizationProfileRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api", notificationRoutes_1.default);
app.use("/api/faceit", faceitRoutes_1.default);
app.use("/api/teams", teamRoutes_1.default);
const messageRoutes_1 = __importStar(require("./routes/messageRoutes"));
(0, messageRoutes_1.setSocketManager)(socketManager);
app.use("/api", messageRoutes_1.default);
app.get("/api/v1", (req, res) => {
    res.json({ message: "E-Sport Connection API v1" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: process.env.NODE_ENV === "development"
            ? err.message
            : "Internal server error",
    });
});
app.all("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await mongoose_1.default.connection.close();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await mongoose_1.default.connection.close();
    process.exit(0);
});
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        setInterval(async () => {
            try {
                await notificationService_1.NotificationService.cleanupOldNotifications();
            }
            catch (error) {
                console.error("Error in notification cleanup job:", error);
            }
        }, 24 * 60 * 60 * 1000);
        try {
            faceitSyncService_1.default.start();
            console.log("🎮 FACEIT sync service started");
        }
        catch (error) {
            console.error("Error starting FACEIT sync service:", error);
        }
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`🔐 OAuth: Google & Facebook enabled`);
            console.log(`🔌 WebSocket: Real-time chat enabled`);
            console.log(`🧹 Notification cleanup: Every 24 hours (7+ days old)`);
            console.log(`🎮 FACEIT sync: Every 30 minutes for linked CS2 players`);
            console.log(`🌐 Server bound to 0.0.0.0:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map