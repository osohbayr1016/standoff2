const mongoose = require("mongoose");
const readline = require("readline");

/**
 * Master Data Restoration Script
 * This script guides you through restoring your old data
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkDatabaseState() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is required");
      console.log("\n💡 Set it in your .env file or environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}\n`);

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Current Users: ${userCount}`);

    if (userCount === 0) {
      console.log("\n❌ CRITICAL: No users found!");
      console.log("   Your data may have been completely deleted.\n");
      return { hasData: false, userCount: 0 };
    }

    // Check for issues
    const usersWithIssues = await usersCollection
      .find({
        $or: [
          { name: { $exists: false } },
          { name: "" },
          { name: null },
          { email: { $exists: false } },
        ],
      })
      .toArray();

    if (usersWithIssues.length > 0) {
      console.log(
        `\n⚠️  Found ${usersWithIssues.length} users with missing data`
      );
      return { hasData: true, userCount, needsFix: true, issues: usersWithIssues.length };
    }

    return { hasData: true, userCount, needsFix: false };
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    return { error: true };
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   DATA RESTORATION WIZARD");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("This script will help you restore your user data.\n");

  // Check current state
  console.log("🔍 Checking current database state...\n");
  const state = await checkDatabaseState();

  if (state.error) {
    console.log("\n❌ Could not connect to database. Please check your MONGODB_URI.");
    process.exit(1);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Provide options based on state
  if (!state.hasData || state.userCount === 0) {
    console.log("❌ NO DATA FOUND\n");
    console.log("Your database appears to be empty or data was deleted.\n");
    console.log("📋 Restoration Options:\n");
    console.log("1. Restore from MongoDB Atlas Backup (if using Atlas)");
    console.log("2. Import from JSON backup file");
    console.log("3. Restore from another database\n");

    const option = await question("Select option (1-3) or 'q' to quit: ");

    if (option === "1") {
      console.log("\n📚 MongoDB Atlas Restoration:");
      console.log("─────────────────────────────");
      console.log("1. Go to: https://cloud.mongodb.com");
      console.log("2. Select your cluster → Backup → Snapshots");
      console.log("3. Find snapshot from BEFORE data loss");
      console.log("4. Click 'Restore' or 'Download'");
      console.log("5. Run: node import-user-data.js <backup-folder>\n");
      console.log("For detailed instructions, run: node restore-from-mongodb-atlas.js");
    } else if (option === "2") {
      const backupPath = await question("\nEnter path to backup folder: ");
      if (backupPath) {
        console.log(`\nTo import, run:`);
        console.log(`  node import-user-data.js ${backupPath}\n`);
      }
    } else if (option === "3") {
      console.log("\n📚 To restore from another database:");
      console.log("─────────────────────────────────────");
      console.log("1. Export from old database:");
      console.log("   mongoexport --uri='OLD_URI' --collection=users --out=users.json");
      console.log("2. Import to current database:");
      console.log("   mongoimport --uri='CURRENT_URI' --collection=users --file=users.json\n");
    }

    rl.close();
    return;
  }

  // Data exists but may need fixing
  if (state.needsFix) {
    console.log("⚠️  DATA ISSUES DETECTED\n");
    console.log(`Found ${state.issues} users with missing/corrupted data.\n`);
    console.log("Would you like to fix the corrupted data?\n");

    const fix = await question("Fix corrupted data? (y/n): ");

    if (fix.toLowerCase() === "y") {
      console.log("\n🔄 Running data restoration script...\n");
      rl.close();

      // Import and run the restoration
      const { restoreUserData } = require("./restore-user-data.js");
      await restoreUserData();
      return;
    }
  } else {
    console.log("✅ Database looks healthy!\n");
    console.log(`Found ${state.userCount} users with no obvious issues.\n`);
  }

  // Offer to backup current state
  console.log("💾 Would you like to backup your current data?\n");
  const backup = await question("Create backup? (y/n): ");

  if (backup.toLowerCase() === "y") {
    console.log("\n💾 Creating backup...\n");
    rl.close();

    const { exportUserData } = require("./export-user-data.js");
    await exportUserData();
    return;
  }

  console.log("\n✅ All done! Your database is ready.\n");
  rl.close();
}

// Handle errors
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  rl.close();
  process.exit(1);
});
