"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
dotenv_1.default.config();
const generateUniqueId = async (inGameName, excludeId) => {
    const baseId = (inGameName || "player")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 15);
    if (baseId.length === 0) {
        const randomBase = Math.random().toString(36).substring(2, 10);
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `player-${randomBase}-${randomSuffix}`;
    }
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    let uniqueId = `${baseId}-${randomSuffix}`;
    let counter = 0;
    while (counter < 20) {
        const existing = await PlayerProfile_1.default.findOne({ uniqueId });
        if (!existing || (excludeId && existing._id.toString() === excludeId)) {
            break;
        }
        uniqueId = `${baseId}-${randomSuffix}-${counter}`;
        counter++;
    }
    return uniqueId;
};
async function addUniqueIdsToProfiles() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        const profilesWithoutId = await PlayerProfile_1.default.find({
            $or: [{ uniqueId: { $exists: false } }, { uniqueId: null }, { uniqueId: "" }],
        });
        console.log(`📊 Found ${profilesWithoutId.length} profiles without unique IDs`);
        if (profilesWithoutId.length === 0) {
            console.log("✅ All profiles already have unique IDs");
            await mongoose_1.default.disconnect();
            return;
        }
        let successCount = 0;
        let errorCount = 0;
        for (const profile of profilesWithoutId) {
            try {
                const uniqueId = await generateUniqueId(profile.inGameName, profile._id.toString());
                profile.uniqueId = uniqueId;
                await profile.save();
                console.log(`✅ Added unique ID "${uniqueId}" to profile: ${profile.inGameName}`);
                successCount++;
            }
            catch (error) {
                console.error(`❌ Error adding unique ID to profile ${profile.inGameName}:`, error.message);
                errorCount++;
            }
        }
        console.log("\n📈 Migration Summary:");
        console.log(`✅ Successfully updated: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📊 Total processed: ${profilesWithoutId.length}`);
        await mongoose_1.default.disconnect();
        console.log("✅ Disconnected from MongoDB");
    }
    catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}
addUniqueIdsToProfiles();
