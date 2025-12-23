"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const StreamSession_1 = __importDefault(require("../models/StreamSession"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
async function createTestStreams() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/esport-connection");
        console.log("Connected to MongoDB");
        const user = await User_1.default.findOne({ role: "PLAYER" });
        if (!user) {
            console.log("No user found. Please create a user first.");
            return;
        }
        console.log(`Using user: ${user.name} (${user.email})`);
        const existingStreams = await StreamSession_1.default.countDocuments();
        if (existingStreams > 0) {
            console.log(`Found ${existingStreams} existing streams. Skipping creation.`);
            return;
        }
        const testStreams = [
            {
                title: "Mobile Legends Ranked Push - Mythic Glory",
                description: "Pushing for Mythic Glory rank in MLBB. Come watch and learn!",
                organizerId: user._id,
                status: "live",
                isPublic: true,
                allowChat: true,
                allowReactions: true,
                quality: "1080p",
                platforms: [],
                externalStreamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                externalPlatform: "youtube",
                externalThumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                isLiveStatus: "live",
                tags: ["MLBB", "Ranked", "Mythic Glory"],
                currentViewers: 1250,
                peakViewers: 1250,
                totalViewers: 1250,
                thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
            },
            {
                title: "Twitch Streaming - Daily Gaming Session",
                description: "Playing Mobile Legends and talking with chat!",
                organizerId: user._id,
                status: "live",
                isPublic: true,
                allowChat: true,
                allowReactions: true,
                quality: "1080p",
                platforms: [],
                externalStreamUrl: "https://www.twitch.tv/ninja",
                externalPlatform: "twitch",
                externalThumbnail: "https://static-cdn.jtvnw.net/previews-ttv/live_user_ninja-{width}x{height}.jpg",
                isLiveStatus: "live",
                tags: ["Gaming", "MLBB", "Live"],
                currentViewers: 856,
                peakViewers: 856,
                totalViewers: 856,
            },
            {
                title: "Kick Gaming Stream - Tournament Prep",
                description: "Preparing for upcoming tournament. Practicing with team!",
                organizerId: user._id,
                status: "live",
                isPublic: true,
                allowChat: true,
                allowReactions: true,
                quality: "1080p",
                platforms: [],
                externalStreamUrl: "https://kick.com/example-streamer",
                externalPlatform: "kick",
                externalThumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800",
                isLiveStatus: "live",
                tags: ["Tournament", "MLBB", "Training"],
                currentViewers: 423,
                peakViewers: 423,
                totalViewers: 423,
            },
            {
                title: "Facebook Gaming - MLBB Guide",
                description: "Sharing tips and tricks for Mobile Legends players",
                organizerId: user._id,
                status: "live",
                isPublic: true,
                allowChat: true,
                allowReactions: true,
                quality: "720p",
                platforms: [],
                externalStreamUrl: "https://www.facebook.com/gaming/example",
                externalPlatform: "facebook",
                externalThumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800",
                isLiveStatus: "live",
                tags: ["Guide", "Tips", "MLBB"],
                currentViewers: 234,
                peakViewers: 234,
                totalViewers: 234,
            },
            {
                title: "YouTube Live - Tournament Commentary",
                description: "Commentary and analysis of current MLBB tournament",
                organizerId: user._id,
                status: "live",
                isPublic: true,
                allowChat: true,
                allowReactions: true,
                quality: "1080p",
                platforms: [],
                externalStreamUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
                externalPlatform: "youtube",
                externalThumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
                isLiveStatus: "live",
                tags: ["Tournament", "Commentary", "Analysis"],
                currentViewers: 1890,
                peakViewers: 1890,
                totalViewers: 1890,
            },
        ];
        const createdStreams = await StreamSession_1.default.insertMany(testStreams);
        console.log(`Created ${createdStreams.length} test streams successfully!`);
        createdStreams.forEach((stream, index) => {
            console.log(`${index + 1}. ${stream.title} - ${stream.externalPlatform} (${stream.currentViewers} viewers)`);
        });
    }
    catch (error) {
        console.error("Error creating test streams:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB");
    }
}
createTestStreams();
