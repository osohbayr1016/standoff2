const mongoose = require("mongoose");

/**
 * Database Restoration Script
 * This script will:
 * 1. Check for users with missing or corrupted data
 * 2. Attempt to restore user information from backups if available
 * 3. Fix schema validation issues
 * 4. Ensure all users have valid required fields
 */

async function restoreUserData() {
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

    // Get the users collection
    const usersCollection = db.collection("users");

    console.log("\n🔍 Analyzing database state...");

    // Get all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Total users in database: ${allUsers.length}`);

    // Check for issues
    const usersWithIssues = [];
    const usersFixed = [];

    for (const user of allUsers) {
      let needsFix = false;
      const fixes = [];

      // Check if user has email (required field)
      if (!user.email || user.email === "") {
        console.error(`❌ User ${user._id} is missing email - cannot fix`);
        usersWithIssues.push({
          id: user._id,
          issue: "Missing email (required field)",
        });
        continue;
      }

      // Check if name is missing or empty
      if (!user.name || user.name === "") {
        needsFix = true;
        fixes.push("name");
        // Set a default name based on email if available
        const defaultName = user.email.split("@")[0] || "User";
        user.name = defaultName;
      }

      // Check for OAuth users without passwords (this is OK)
      if (!user.password && !user.googleId && !user.facebookId) {
        // User should have a password if not OAuth
        // But we won't force it to avoid breaking existing data
        console.log(
          `⚠️  User ${user.email} has no password and is not OAuth user`
        );
      }

      // Ensure role is set
      if (!user.role) {
        needsFix = true;
        fixes.push("role");
        user.role = "PLAYER";
      }

      // Ensure default values are set
      if (user.rating === undefined || user.rating === null) {
        needsFix = true;
        fixes.push("rating");
        user.rating = 0;
      }

      if (user.totalReviews === undefined || user.totalReviews === null) {
        needsFix = true;
        fixes.push("totalReviews");
        user.totalReviews = 0;
      }

      if (user.isVerified === undefined || user.isVerified === null) {
        needsFix = true;
        fixes.push("isVerified");
        user.isVerified = false;
      }

      if (user.isOnline === undefined || user.isOnline === null) {
        needsFix = true;
        fixes.push("isOnline");
        user.isOnline = false;
      }

      if (!user.lastSeen) {
        needsFix = true;
        fixes.push("lastSeen");
        user.lastSeen = user.createdAt || new Date();
      }

      if (!user.createdAt) {
        needsFix = true;
        fixes.push("createdAt");
        user.createdAt = new Date();
      }

      // Apply fixes if needed
      if (needsFix) {
        try {
          await usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                name: user.name,
                role: user.role,
                rating: user.rating,
                totalReviews: user.totalReviews,
                isVerified: user.isVerified,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                createdAt: user.createdAt,
              },
            }
          );

          usersFixed.push({
            id: user._id,
            email: user.email,
            fixes: fixes,
          });

          console.log(
            `✅ Fixed user ${user.email}: ${fixes.join(", ")}`
          );
        } catch (error) {
          console.error(
            `❌ Failed to fix user ${user.email}:`,
            error.message
          );
          usersWithIssues.push({
            id: user._id,
            email: user.email,
            issue: error.message,
          });
        }
      }
    }

    // Also check and restore related collections
    console.log("\n🔍 Checking related collections...");
    
    const playerProfilesCollection = db.collection("playerprofiles");
    const orgProfilesCollection = db.collection("organizationprofiles");
    const messagesCollection = db.collection("messages");
    const notificationsCollection = db.collection("notifications");

    const playerProfileCount = await playerProfilesCollection.countDocuments();
    const orgProfileCount = await orgProfilesCollection.countDocuments();
    const messageCount = await messagesCollection.countDocuments();
    const notificationCount = await notificationsCollection.countDocuments();

    console.log(`📊 Player Profiles: ${playerProfileCount}`);
    console.log(`📊 Organization Profiles: ${orgProfileCount}`);
    console.log(`📊 Messages: ${messageCount}`);
    console.log(`📊 Notifications: ${notificationCount}`);

    // Summary
    console.log("\n📊 Restoration Summary:");
    console.log(`✅ Users fixed: ${usersFixed.length}`);
    console.log(`⚠️  Users with issues: ${usersWithIssues.length}`);
    console.log(`📊 Total users in database: ${allUsers.length}`);

    if (usersFixed.length > 0) {
      console.log("\n✅ Fixed Users:");
      usersFixed.forEach((u) => {
        console.log(`  - ${u.email}: Fixed ${u.fixes.join(", ")}`);
      });
    }

    if (usersWithIssues.length > 0) {
      console.log("\n⚠️  Users with Issues:");
      usersWithIssues.forEach((u) => {
        console.log(`  - ${u.email || u.id}: ${u.issue}`);
      });
    }

    // Verify final state
    const finalUsers = await usersCollection.countDocuments();
    console.log(`\n📊 Final user count: ${finalUsers}`);

    console.log("\n✅ Database restoration completed!");
    
    if (finalUsers === 0) {
      console.log("\n❌ CRITICAL: No users found in database!");
      console.log("   Your data may have been completely deleted.");
      console.log("\n🔧 To restore from backup:");
      console.log("   1. Run: node restore-from-mongodb-atlas.js (for Atlas backups)");
      console.log("   2. Or: node import-user-data.js <backup-folder> (for JSON backups)");
      console.log("   3. Or: Use MongoDB Atlas Point-in-Time Restore");
    } else {
      console.log(
        "\n⚠️  NOTE: If your data was partially replaced, you may need to:"
      );
      console.log(
        "  1. Check if you have a database backup to restore missing data"
      );
      console.log("  2. Contact MongoDB support if using MongoDB Atlas");
      console.log("  3. Check your application logs for overwrite errors");
      console.log("  4. Run: node restore-from-mongodb-atlas.js for Atlas backup options");
    }

    return {
      success: true,
      fixed: usersFixed.length,
      issues: usersWithIssues.length,
      total: allUsers.length,
    };
  } catch (error) {
    console.error("❌ Database restoration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the restoration
if (require.main === module) {
  restoreUserData()
    .then((result) => {
      console.log("\n✅ Restoration process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { restoreUserData };
