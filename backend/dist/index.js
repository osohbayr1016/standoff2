"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const passport_1 = __importDefault(require("./config/passport"));
const database_1 = require("./config/database");
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://e-sport-connection.vercel.app",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
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
}
else {
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
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const notificationService_1 = require("./utils/notificationService");
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/player-profiles", playerProfileRoutes_1.default);
app.use("/api/organization-profiles", organizationProfileRoutes_1.default);
app.use("/api", notificationRoutes_1.default);
app.use("/api", statsRoutes_1.default);
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
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
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map