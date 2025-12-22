/**
 * Standoff 2 Database Setup Script
 * Creates all necessary collections and indexes in MongoDB
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required");
  process.exit(1);
}

// Collection schemas definition
const collections = [
  {
    name: "users",
    indexes: [
      { key: { email: 1 }, options: { unique: true } },
      { key: { googleId: 1 }, options: { unique: true, sparse: true } },
      { key: { facebookId: 1 }, options: { unique: true, sparse: true } },
      { key: { role: 1 } },
      { key: { isOnline: 1 } },
    ],
  },
  {
    name: "playerprofiles",
    indexes: [
      { key: { userId: 1 }, options: { unique: true } },
      { key: { game: 1 } },
      { key: { category: 1 } },
      { key: { isLookingForTeam: 1 } },
      { key: { inGameName: 1 } },
      { key: { elo: -1 } },
    ],
  },
  {
    name: "matches",
    indexes: [
      { key: { status: 1, createdAt: -1 } },
      { key: { type: 1, status: 1 } },
      { key: { challengerSquadId: 1 } },
      { key: { opponentSquadId: 1 } },
      { key: { deadline: 1 } },
      { key: { resultDeadline: 1 } },
    ],
  },
  {
    name: "squads",
    indexes: [
      { key: { name: 1 }, options: { unique: true } },
      { key: { leaderId: 1 } },
      { key: { "members.userId": 1 } },
      { key: { isPublic: 1 } },
    ],
  },
  {
    name: "leaderboardentries",
    indexes: [
      { key: { playerId: 1 }, options: { unique: true } },
      { key: { elo: -1 } },
      { key: { wins: -1 } },
      { key: { rank: 1 } },
      { key: { season: 1 } },
    ],
  },
  {
    name: "tournaments",
    indexes: [
      { key: { status: 1 } },
      { key: { startDate: 1 } },
      { key: { organizerId: 1 } },
      { key: { game: 1 } },
    ],
  },
  {
    name: "tournamentregistrations",
    indexes: [
      { key: { tournamentId: 1, squadId: 1 }, options: { unique: true } },
      { key: { status: 1 } },
    ],
  },
  {
    name: "tournamentmatches",
    indexes: [
      { key: { tournamentId: 1 } },
      { key: { round: 1 } },
      { key: { status: 1 } },
    ],
  },
  {
    name: "achievements",
    indexes: [
      { key: { code: 1 }, options: { unique: true } },
      { key: { category: 1 } },
      { key: { isActive: 1 } },
    ],
  },
  {
    name: "userachievements",
    indexes: [
      { key: { userId: 1, achievementId: 1 }, options: { unique: true } },
      { key: { unlockedAt: -1 } },
    ],
  },
  {
    name: "badges",
    indexes: [
      { key: { code: 1 }, options: { unique: true } },
      { key: { category: 1 } },
    ],
  },
  {
    name: "userbadges",
    indexes: [
      { key: { userId: 1, badgeId: 1 }, options: { unique: true } },
      { key: { earnedAt: -1 } },
    ],
  },
  {
    name: "bountycoins",
    indexes: [{ key: { userId: 1 }, options: { unique: true } }],
  },
  {
    name: "notifications",
    indexes: [
      { key: { userId: 1, isRead: 1 } },
      { key: { createdAt: -1 } },
      { key: { type: 1 } },
    ],
  },
  {
    name: "messages",
    indexes: [
      { key: { senderId: 1, receiverId: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: "matchchats",
    indexes: [{ key: { matchId: 1 } }, { key: { createdAt: -1 } }],
  },
  {
    name: "streamsessions",
    indexes: [
      { key: { streamerId: 1 } },
      { key: { status: 1 } },
      { key: { startedAt: -1 } },
    ],
  },
  {
    name: "streamviewers",
    indexes: [{ key: { streamId: 1, odayerId: 1 }, options: { unique: true } }],
  },
  {
    name: "streamchats",
    indexes: [{ key: { streamId: 1 } }, { key: { createdAt: -1 } }],
  },
  {
    name: "news",
    indexes: [
      { key: { publishedAt: -1 } },
      { key: { category: 1 } },
      { key: { isPublished: 1 } },
    ],
  },
  {
    name: "settings",
    indexes: [{ key: { userId: 1 }, options: { unique: true } }],
  },
  {
    name: "organizationprofiles",
    indexes: [
      { key: { userId: 1 }, options: { unique: true } },
      { key: { name: 1 } },
    ],
  },
  {
    name: "proplayers",
    indexes: [
      { key: { inGameName: 1 } },
      { key: { team: 1 } },
      { key: { role: 1 } },
    ],
  },
  {
    name: "squadapplications",
    indexes: [
      { key: { squadId: 1, playerId: 1 }, options: { unique: true } },
      { key: { status: 1 } },
    ],
  },
  {
    name: "squadinvitations",
    indexes: [
      { key: { squadId: 1, playerId: 1 }, options: { unique: true } },
      { key: { status: 1 } },
    ],
  },
  {
    name: "withdrawrequests",
    indexes: [
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: "purchaserequests",
    indexes: [
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
];

async function setupDatabase() {
  console.log("🚀 Starting Standoff 2 Database Setup...\n");
  console.log(`📦 Database: standoff2`);
  console.log(`🔗 Connecting to MongoDB Atlas...\n`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Connected to MongoDB successfully!\n");
    console.log(`📊 Database: ${mongoose.connection.name}\n`);

    const db = mongoose.connection.db;

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map((c) => c.name);

    console.log("📋 Creating collections and indexes...\n");

    for (const collection of collections) {
      try {
        // Create collection if it doesn't exist
        if (!existingNames.includes(collection.name)) {
          await db.createCollection(collection.name);
          console.log(`  ✅ Created collection: ${collection.name}`);
        } else {
          console.log(`  ⏭️  Collection exists: ${collection.name}`);
        }

        // Create indexes
        const col = db.collection(collection.name);
        for (const index of collection.indexes) {
          try {
            await col.createIndex(index.key, index.options || {});
          } catch (indexErr) {
            // Index might already exist, that's fine
          }
        }
        console.log(`     📑 Indexes created for ${collection.name}`);
      } catch (err) {
        console.error(`  ❌ Error with ${collection.name}:`, err.message);
      }
    }

    console.log("\n🎉 Database setup completed successfully!\n");

    // Show summary
    const finalCollections = await db.listCollections().toArray();
    console.log(`📊 Total collections: ${finalCollections.length}`);
    console.log("\n📋 Collections in database:");
    finalCollections.forEach((c) => {
      console.log(`   - ${c.name}`);
    });
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);

    if (error.message.includes("bad auth")) {
      console.error(
        "\n🔐 Authentication Error: Check your MongoDB credentials"
      );
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the setup
setupDatabase();
