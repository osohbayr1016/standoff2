import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const samplePlayers = [
  {
    userId: "507f1f77bcf86cd799439011", // Mock user ID
    category: "Mobile",
    game: "Mobile Legends",
    role: "Fighter",
    inGameName: "DragonSlayer",
    rank: "Mythical Glory",
    rankStars: 150,
    preferredRoles: ["Fighter", "Tank"],
    experience: "3 years",
    bio: "Professional Mobile Legends player with 3 years of experience. Specialized in Fighter and Tank roles.",
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
    role: "Assassin",
    inGameName: "ShadowKnight",
    rank: "Mythical Glory",
    rankStars: 200,
    preferredRoles: ["Assassin", "Mage"],
    experience: "2 years",
    bio: "Aggressive player specializing in Assassin and Mage roles. Looking for competitive team.",
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
    role: "Marksman",
    inGameName: "PhoenixRise",
    rank: "Mythical Glory",
    rankStars: 100,
    preferredRoles: ["Marksman", "Support"],
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
    role: "Fighter",
    inGameName: "ThunderStrike",
    rank: "Mythic",
    preferredRoles: ["Fighter", "Tank"],
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
    role: "Mage",
    inGameName: "IceQueen",
    rank: "Legend",
    preferredRoles: ["Mage", "Support"],
    experience: "2 years",
    bio: "Strategic player with excellent map awareness and team fighting skills.",
    isLookingForTeam: false,
    achievements: ["Best Mage", "Strategic Player"],
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
    role: "Marksman",
    inGameName: "StarGazer",
    rank: "Mythical Glory",
    rankStars: 300,
    preferredRoles: ["Marksman", "Assassin"],
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
    role: "Tank",
    inGameName: "WindWalker",
    rank: "Epic",
    preferredRoles: ["Tank", "Support"],
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
    role: "Fighter",
    inGameName: "FireLord",
    rank: "Mythical Glory",
    rankStars: 120,
    preferredRoles: ["Fighter", "Mage"],
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

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Clear existing player profiles
    await PlayerProfile.deleteMany({ game: "Mobile Legends" });
    console.log("🗑️ Cleared existing Mobile Legends player profiles");

    // Create sample players
    const createdPlayers = await PlayerProfile.insertMany(samplePlayers);
    console.log(`✅ Created ${createdPlayers.length} sample players`);

    // Display created players
    createdPlayers.forEach((player, index) => {
      const starInfo =
        player.rank === "Mythical Glory" && player.rankStars
          ? ` ⭐ ${player.rankStars}`
          : "";
      console.log(
        `${index + 1}. ${player.inGameName} - ${player.rank}${starInfo}`
      );
    });

    console.log("🎉 Sample players created successfully!");
  } catch (error) {
    console.error("❌ Error creating sample players:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createSamplePlayers();
