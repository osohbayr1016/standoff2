const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

/**
 * Restore data from MongoDB Atlas Snapshots
 * 
 * This script helps you restore data from MongoDB Atlas automated backups
 * You need to:
 * 1. Go to MongoDB Atlas → Clusters → Your Cluster → Backup → Snapshots
 * 2. Create a download link or restore point
 * 3. Or use Atlas CLI to restore from a snapshot
 * 
 * For manual restoration instructions, see: DATABASE_RESTORATION_GUIDE.md
 */

async function checkMongoDBAtlasRestore() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is required");
      process.exit(1);
    }

    console.log("🔍 Checking MongoDB Atlas restoration options...\n");

    console.log("📋 MongoDB Atlas Restoration Methods:\n");

    console.log("METHOD 1: Restore from Atlas Dashboard");
    console.log("───────────────────────────────────────");
    console.log("1. Go to: https://cloud.mongodb.com");
    console.log("2. Select your cluster");
    console.log("3. Click 'Backup' in the left sidebar");
    console.log("4. Go to 'Snapshots' tab");
    console.log("5. Find a snapshot from BEFORE your data was lost");
    console.log("6. Click 'Restore' or 'Download'");
    console.log("7. Follow the restoration wizard\n");

    console.log("METHOD 2: Use MongoDB Atlas CLI (mongocli)");
    console.log("───────────────────────────────────────────");
    console.log("1. Install: npm install -g mongodb-atlas-cli");
    console.log("2. Login: atlas auth login");
    console.log("3. List snapshots: atlas backups snapshots list");
    console.log("4. Restore: atlas backups snapshots restore <snapshot-id>");
    console.log("5. See: https://www.mongodb.com/docs/atlas/backup/restore/\n");

    console.log("METHOD 3: Point-in-Time Restore (PITR)");
    console.log("───────────────────────────────────────");
    console.log("1. Go to Atlas → Backup → Point in Time Restore");
    console.log("2. Select a date/time BEFORE data loss");
    console.log("3. Create new cluster from that point");
    console.log("4. Export data from restored cluster");
    console.log("5. Import into your current database\n");

    console.log("METHOD 4: Manual Export/Import");
    console.log("───────────────────────────────");
    console.log("If you have access to the old database:");
    console.log("1. Export: mongoexport --uri='OLD_DB_URI' --collection=users --out=users.json");
    console.log("2. Import: mongoimport --uri='NEW_DB_URI' --collection=users --file=users.json\n");

    // Check if we can connect and see current state
    console.log("🔍 Checking current database state...\n");

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`\n📊 Current Collections: ${collections.length}`);
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`   - ${coll.name}: ${count} documents`);
    }

    // Check users specifically
    const usersCollection = db.collection("users");
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Current Users: ${userCount}`);

    if (userCount === 0) {
      console.log("\n⚠️  WARNING: No users found in database!");
      console.log("   Your data may have been deleted.");
      console.log("   You MUST restore from a backup.\n");
    } else {
      // Check for potential issues
      const usersWithoutName = await usersCollection.countDocuments({
        $or: [{ name: { $exists: false } }, { name: "" }, { name: null }],
      });

      if (usersWithoutName > 0) {
        console.log(
          `\n⚠️  Found ${usersWithoutName} users without names - run restore-user-data.js`
        );
      }
    }

    console.log("\n📝 Next Steps:");
    console.log("1. If you have Atlas backups, use METHOD 1, 2, or 3 above");
    console.log("2. If you have exported JSON files, use import-user-data.js");
    console.log("3. If data is just corrupted, run restore-user-data.js");
    console.log("4. If you have another database with the data, export and import it\n");

    return { success: true };
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the check
if (require.main === module) {
  checkMongoDBAtlasRestore()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { checkMongoDBAtlasRestore };
