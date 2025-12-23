"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
async function initializeAchievements() {
    try {
        console.log("🚀 Initializing achievement system...");
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        console.log("✅ Achievement system initialized successfully!");
        console.log("📝 Note: Achievements and badges will be created by admins through the admin panel");
    }
    catch (error) {
        console.error("❌ Error initializing achievement system:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}
if (require.main === module) {
    initializeAchievements();
}
exports.default = initializeAchievements;
