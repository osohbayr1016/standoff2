const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/**
 * Export current user data to JSON backup
 * Run this BEFORE making any changes to preserve current state
 */

async function exportUserData() {
  try {
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

    // Export all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections`);

    const backupDir = path.join(__dirname, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    console.log(`\n💾 Exporting data to: ${backupPath}`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);

      console.log(`\n📦 Exporting collection: ${collectionName}...`);

      const data = await collection.find({}).toArray();
      const filePath = path.join(backupPath, `${collectionName}.json`);

      fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2),
        "utf8"
      );

      console.log(
        `  ✅ Exported ${data.length} documents to ${collectionName}.json`
      );
    }

    // Create summary
    const summary = {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.name,
      collections: collections.map((c) => c.name),
      backupPath: backupPath,
    };

    fs.writeFileSync(
      path.join(backupPath, "summary.json"),
      JSON.stringify(summary, null, 2),
      "utf8"
    );

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 Backup location: ${backupPath}`);
    console.log(`\n⚠️  Keep this backup safe! You can use it to restore data later.`);

    return { success: true, backupPath };
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the export
if (require.main === module) {
  exportUserData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { exportUserData };
