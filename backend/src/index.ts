import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport";
import { connectDB } from "./config/database";
import mongoose from "./config/database";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "E-Sport Connection API is running",
    timestamp: new Date().toISOString(),
  });
});

// Import routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import messageRoutes from "./routes/messageRoutes";

// API routes
app.use("/api/auth", authRoutes as express.Router);
app.use("/api/users", userRoutes as express.Router);
app.use("/api", messageRoutes as express.Router);
app.use(
  "/api/v1",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.json({ message: "E-Sport Connection API v1" });
  }
);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Something went wrong!",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

// 404 handler
app.use(
  "*",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(404).json({ error: "Route not found" });
  }
);

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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔐 OAuth: Google & Facebook enabled`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
