const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/**
 * Import user data from JSON backup
 * Usage: node import-user-data.js <backup-folder-path>
 * Example: node import-user-data.js backups/backup-2024-01-01T12-00-00-000Z
 */

async function importUserData(backupPath) {
  try {
    if (!backupPath) {
      console.error("❌ Please provide backup folder path");
      console.error("Usage: node import-user-data.js <backup-folder-path>");
      process.exit(1);
    }

    const fullBackupPath = path.isAbsolute(backupPath)
      ? backupPath
      : path.join(__dirname, backupPath);

    if (!fs.existsSync(fullBackupPath)) {
      console.error(`❌ Backup folder not found: ${fullBackupPath}`);
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is required");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Get the database
    const db = mongoose.connection.db;

    // Read summary
    const summaryPath = path.join(fullBackupPath, "summary.json");
    let summary = null;
    if (fs.existsSync(summaryPath)) {
      summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
      console.log(`\n📋 Backup Info:`);
      console.log(`   Created: ${summary.timestamp}`);
      console.log(`   Collections: ${summary.collections.length}`);
    }

    // Read all JSON files in backup folder
    const files = fs.readdirSync(fullBackupPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json") && f !== "summary.json");

    console.log(`\n🔄 Importing ${jsonFiles.length} collections...`);

    for (const jsonFile of jsonFiles) {
      const collectionName = jsonFile.replace(".json", "");
      const filePath = path.join(fullBackupPath, jsonFile);

      console.log(`\n📦 Importing collection: ${collectionName}...`);

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (data.length === 0) {
        console.log(`  ⚠️  Collection is empty, skipping...`);
        continue;
      }

      const collection = db.collection(collectionName);

      // Clear existing data (optional - comment out to merge instead)
      console.log(`  🗑️  Clearing existing ${collectionName} data...`);
      await collection.deleteMany({});

      // Insert backup data
      console.log(`  📥 Inserting ${data.length} documents...`);

      // Insert in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await collection.insertMany(batch, { ordered: false });
      }

      console.log(`  ✅ Successfully imported ${data.length} documents`);
    }

    console.log(`\n✅ Import completed successfully!`);
    console.log(
      `\n⚠️  All existing data was replaced. If you need to merge instead, edit this script.`
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Get backup path from command line
const backupPath = process.argv[2];

// Run the import
if (require.main === module) {
  importUserData(backupPath)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { importUserData };
