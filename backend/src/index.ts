import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import { createServer } from "http";
import passport from "./config/passport";
import { connectDB } from "./config/database";
import mongoose from "mongoose";
// Socket removed for production stability

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8000;

// Real-time sockets disabled

// Middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://e-sport-connection.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors());

// Session configuration with production-ready store
const sessionConfig: any = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Use MemoryStore only in development
if (process.env.NODE_ENV === "production") {
  // In production, you might want to use Redis or MongoDB for session storage
  // For now, we'll use MemoryStore but with a warning
} else {
  // Development session configuration
}

app.use(session(sessionConfig));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (req: any, res: any) => {
  res.status(200).json({
    status: "OK",
    message: "E-Sport Connection API is running",
    timestamp: new Date().toISOString(),
  });
});

// CORS test endpoint
app.get("/api/test-cors", (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: "CORS is working!",
    timestamp: new Date().toISOString(),
  });
});

// Import routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import playerProfileRoutes from "./routes/playerProfileRoutes";
import organizationProfileRoutes from "./routes/organizationProfileRoutes";
// Upload routes removed due to Cloudinary/multer removal
import notificationRoutes from "./routes/notificationRoutes";
import { NotificationService } from "./utils/notificationService";
import statsRoutes from "./routes/statsRoutes";

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/player-profiles", playerProfileRoutes);
app.use("/api/organization-profiles", organizationProfileRoutes);
// app.use("/api/upload", uploadRoutes);
app.use("/api", notificationRoutes);
app.use("/api", statsRoutes);

// Import and set up message routes after socket manager is initialized
import messageRoutes from "./routes/messageRoutes";
app.use("/api", messageRoutes);
app.get("/api/v1", (req: any, res: any) => {
  res.json({ message: "E-Sport Connection API v1" });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.all("*", (req: any, res: any) => {
  res.status(404).json({ error: "Route not found" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Set up notification cleanup job (runs every 24 hours)
    setInterval(async () => {
      try {
        await NotificationService.cleanupOldNotifications();
      } catch (error) {
        console.error("Error in notification cleanup job:", error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Listen on the specified port
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
