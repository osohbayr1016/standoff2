const mongoose = require("mongoose");

async function migrateDatabase() {
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

    console.log("🔍 Checking current database state...");

    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    // Check for username index
    const usernameIndex = indexes.find(
      (index) => index.key && index.key.username === 1
    );

    if (usernameIndex) {
      console.log("⚠️  Found username index, removing it...");
      try {
        await usersCollection.dropIndex("username_1");
        console.log("✅ Username index removed successfully");
      } catch (error) {
        console.log(
          "⚠️  Could not drop username_1 index, trying alternative name..."
        );
        try {
          await usersCollection.dropIndex("username");
          console.log("✅ Username index removed successfully");
        } catch (error2) {
          console.error("❌ Failed to remove username index:", error2.message);
        }
      }
    } else {
      console.log("✅ No username index found");
    }

    // Check for any users with username field and remove it
    const usersWithUsername = await usersCollection
      .find({
        username: { $exists: true },
      })
      .toArray();

    if (usersWithUsername.length > 0) {
      console.log(
        `⚠️  Found ${usersWithUsername.length} users with username field`
      );
      console.log("Removing username field from all users...");

      const result = await usersCollection.updateMany(
        { username: { $exists: true } },
        { $unset: { username: "" } }
      );

      console.log(
        `✅ Removed username field from ${result.modifiedCount} users`
      );
    } else {
      console.log("✅ No users with username field found");
    }

    // Check for any users with null name or email
    const usersWithNullFields = await usersCollection
      .find({
        $or: [{ name: null }, { name: "" }, { email: null }, { email: "" }],
      })
      .toArray();

    if (usersWithNullFields.length > 0) {
      console.log(
        `⚠️  Found ${usersWithNullFields.length} users with null/empty fields`
      );
      console.log("Users with issues:", usersWithNullFields);
    } else {
      console.log("✅ No users with null/empty required fields");
    }

    // Verify final state
    const finalIndexes = await usersCollection.indexes();
    console.log("Final indexes:", JSON.stringify(finalIndexes, null, 2));

    const totalUsers = await usersCollection.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    console.log("✅ Database migration completed successfully");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
migrateDatabase();
