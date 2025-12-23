"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Tournament_1 = __importDefault(require("../models/Tournament"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function clearAllTournaments() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        const countBefore = await Tournament_1.default.countDocuments();
        console.log(`📊 Found ${countBefore} tournaments in database`);
        if (countBefore === 0) {
            console.log("ℹ️ No tournaments found to delete");
            return;
        }
        const result = await Tournament_1.default.deleteMany({});
        console.log(`🗑️ Deleted ${result.deletedCount} tournaments`);
        const countAfter = await Tournament_1.default.countDocuments();
        console.log(`📊 Remaining tournaments: ${countAfter}`);
        if (countAfter === 0) {
            console.log("✅ All tournaments successfully removed!");
        }
        else {
            console.log("⚠️ Some tournaments may still exist");
        }
    }
    catch (error) {
        console.error("❌ Error clearing tournaments:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}
clearAllTournaments();
