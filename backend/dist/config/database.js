"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        console.log("🔄 Attempting to connect to MongoDB...");
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: "majority",
        });
        console.log("✅ MongoDB connected successfully");
        console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        if (error.message?.includes("bad auth")) {
            console.error("\n🔐 Authentication Error: Check your MongoDB credentials");
            console.error("💡 Solutions:");
            console.error("   1. Verify username and password in MONGODB_URI");
            console.error("   2. Check MongoDB Atlas → Database Access");
            console.error("   3. Ensure user has proper permissions");
            console.error("   4. URL encode special characters in password\n");
        }
        else if (error.message?.includes("ENOTFOUND")) {
            console.error("\n🌐 Network Error: Cannot reach MongoDB cluster");
            console.error("💡 Check your connection string format\n");
        }
        process.exit(1);
    }
};
exports.default = connectDB;
