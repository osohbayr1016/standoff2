"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const samplePlayers = [
    {
        userId: "507f1f77bcf86cd799439011",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Exp Laner",
        inGameName: "DragonSlayer",
        rank: "Mythical Glory",
        rankStars: 150,
        preferredRoles: ["Exp Laner", "Roamer"],
        experience: "3 years",
        bio: "Professional Mobile Legends player with 3 years of experience. Specialized in Exp Laner and Roamer roles.",
        isLookingForTeam: true,
        achievements: ["Season MVP", "Tournament Winner"],
        availability: {
            weekdays: true,
            weekends: true,
            timezone: "UTC+8",
            preferredHours: "19:00-23:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439012",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Core",
        inGameName: "ShadowKnight",
        rank: "Mythical Glory",
        rankStars: 200,
        preferredRoles: ["Core", "Mid Laner"],
        experience: "2 years",
        bio: "Aggressive player specializing in Core and Mid Laner roles. Looking for competitive team.",
        isLookingForTeam: false,
        achievements: ["Kill Leader", "Fastest Victory"],
        availability: {
            weekdays: true,
            weekends: false,
            timezone: "UTC+8",
            preferredHours: "20:00-24:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439013",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Gold Laner",
        inGameName: "PhoenixRise",
        rank: "Mythical Glory",
        rankStars: 100,
        preferredRoles: ["Gold Laner", "Support"],
        experience: "4 years",
        bio: "Veteran player with excellent positioning and team coordination skills.",
        isLookingForTeam: true,
        achievements: ["Best Support", "Team Player"],
        availability: {
            weekdays: true,
            weekends: true,
            timezone: "UTC+8",
            preferredHours: "18:00-22:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439014",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Exp Laner",
        inGameName: "ThunderStrike",
        rank: "Mythic",
        preferredRoles: ["Exp Laner", "Roamer"],
        experience: "1 year",
        bio: "Rising star in the Mobile Legends community. Strong mechanical skills.",
        isLookingForTeam: true,
        achievements: ["Rookie of the Year"],
        availability: {
            weekdays: true,
            weekends: true,
            timezone: "UTC+8",
            preferredHours: "19:00-23:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439015",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Mid Laner",
        inGameName: "IceQueen",
        rank: "Legend",
        preferredRoles: ["Mid Laner", "Support"],
        experience: "2 years",
        bio: "Strategic player with excellent map awareness and team fighting skills.",
        isLookingForTeam: false,
        achievements: ["Best Mid Laner", "Strategic Player"],
        availability: {
            weekdays: false,
            weekends: true,
            timezone: "UTC+8",
            preferredHours: "14:00-18:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439016",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Gold Laner",
        inGameName: "StarGazer",
        rank: "Mythical Glory",
        rankStars: 300,
        preferredRoles: ["Gold Laner", "Core"],
        experience: "5 years",
        bio: "Elite player with exceptional mechanical skills and game knowledge.",
        isLookingForTeam: true,
        achievements: ["Elite Player", "Mechanical Master"],
        availability: {
            weekdays: true,
            weekends: true,
            timezone: "UTC+8",
            preferredHours: "20:00-02:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439017",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Roamer",
        inGameName: "WindWalker",
        rank: "Epic",
        preferredRoles: ["Roamer", "Support"],
        experience: "1 year",
        bio: "New player with good potential and team-oriented mindset.",
        isLookingForTeam: true,
        achievements: ["Most Improved"],
        availability: {
            weekdays: true,
            weekends: true,
            timezone: "UTC+8",
            preferredHours: "18:00-22:00",
        },
        languages: ["English", "Mongolian"],
    },
    {
        userId: "507f1f77bcf86cd799439018",
        category: "Mobile",
        game: "Mobile Legends",
        role: "Exp Laner",
        inGameName: "FireLord",
        rank: "Mythical Glory",
        rankStars: 120,
        preferredRoles: ["Exp Laner", "Mid Laner"],
        experience: "3 years",
        bio: "Versatile player who can adapt to different team compositions.",
        isLookingForTeam: false,
        achievements: ["Versatile Player", "Adaptation Master"],
        availability: {
            weekdays: true,
            weekends: false,
            timezone: "UTC+8",
            preferredHours: "19:00-23:00",
        },
        languages: ["English", "Mongolian"],
    },
];
async function createSamplePlayers() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is required");
        }
        await mongoose_1.default.connect(mongoURI);
        console.log("✅ Connected to MongoDB");
        await PlayerProfile_1.default.deleteMany({ game: "Mobile Legends" });
        console.log("🗑️ Cleared existing Mobile Legends player profiles");
        const createdPlayers = await PlayerProfile_1.default.insertMany(samplePlayers);
        console.log(`✅ Created ${createdPlayers.length} sample players`);
        createdPlayers.forEach((player, index) => {
            const starInfo = player.rank === "Mythical Glory" && player.rankStars
                ? ` ⭐ ${player.rankStars}`
                : "";
            console.log(`${index + 1}. ${player.inGameName} - ${player.rank}${starInfo}`);
        });
        console.log("🎉 Sample players created successfully!");
    }
    catch (error) {
        console.error("❌ Error creating sample players:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}
createSamplePlayers();
