#!/usr/bin/env node
/**
 * MongoDB Connection Test Script
 * Run this to test your MongoDB connection string before deploying to Render
 *
 * Usage: node test-mongodb-connection.js "your-mongodb-uri"
 * Example: node test-mongodb-connection.js "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
 */

const mongoose = require("mongoose");

// Get connection string from command line argument or prompt for it
const mongoURI = process.argv[2];

if (!mongoURI) {
  console.error("\n❌ Error: No MongoDB URI provided");
  console.log("\n📖 Usage:");
  console.log(
    '   node test-mongodb-connection.js "mongodb+srv://username:password@cluster.mongodb.net/database"'
  );
  console.log("\n💡 Example:");
  console.log(
    '   node test-mongodb-connection.js "mongodb+srv://osohbayar:MyPass123@mentormeet.xfipt6t.mongodb.net/e-sport-connection"'
  );
  console.log("\n⚠️  Make sure to wrap the URI in quotes!\n");
  process.exit(1);
}

console.log("\n🔍 Testing MongoDB Connection...\n");
console.log("📍 Connection URI:", mongoURI.replace(/:[^:@]+@/, ":****@")); // Hide password
console.log("⏳ Connecting...\n");

// Set a timeout for the connection attempt
const timeout = setTimeout(() => {
  console.error("❌ Connection timeout after 15 seconds");
  console.log("\n💡 This usually means:");
  console.log(
    "   1. Your IP is not whitelisted in MongoDB Atlas Network Access"
  );
  console.log("   2. The cluster URL is incorrect");
  console.log("   3. Network connectivity issues\n");
  process.exit(1);
}, 15000);

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    clearTimeout(timeout);
    console.log("✅ SUCCESS! MongoDB connection established!\n");
    console.log("📊 Connection Details:");
    console.log("   - Host:", mongoose.connection.host);
    console.log("   - Database:", mongoose.connection.name);
    console.log(
      "   - State:",
      mongoose.connection.readyState === 1 ? "Connected" : "Unknown"
    );
    console.log("\n🎉 Your MongoDB URI is working correctly!");
    console.log("📋 Next Steps:");
    console.log("   1. Go to https://dashboard.render.com");
    console.log("   2. Select your e-sport-connection-backend service");
    console.log("   3. Go to Environment tab");
    console.log("   4. Update MONGODB_URI with this connection string");
    console.log("   5. Save and wait for auto-redeploy\n");

    // Close connection and exit
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error("❌ FAILED! MongoDB connection error:\n");

    // Provide specific error messages based on error type
    if (error.message.includes("bad auth")) {
      console.error(
        "🔐 Authentication Error: Username or password is incorrect\n"
      );
      console.log("💡 Solutions:");
      console.log("   1. Go to MongoDB Atlas → Database Access");
      console.log("   2. Verify the username exists");
      console.log("   3. Click Edit and reset the password");
      console.log("   4. Use a simple password (only letters and numbers)");
      console.log(
        "   5. Update your connection string with the new password\n"
      );
    } else if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("queryTxt")
    ) {
      console.error("🌐 DNS/Network Error: Cannot reach MongoDB cluster\n");
      console.log("💡 Solutions:");
      console.log("   1. Check your internet connection");
      console.log("   2. Verify the cluster URL is correct");
      console.log("   3. Try: mongodb+srv://..., not mongodb://...\n");
    } else if (
      error.message.includes("not authorized") ||
      error.message.includes("unauthorized")
    ) {
      console.error("🔒 Authorization Error: User lacks permissions\n");
      console.log("💡 Solutions:");
      console.log("   1. Go to MongoDB Atlas → Database Access");
      console.log("   2. Edit your user");
      console.log(
        '   3. Set Built-in Role to "Atlas admin" or "Read and write to any database"'
      );
      console.log("   4. Save changes and wait 2 minutes\n");
    } else if (
      error.message.includes("IP") ||
      error.message.includes("whitelist")
    ) {
      console.error("🚫 IP Whitelist Error: Your IP is not allowed\n");
      console.log("💡 Solutions:");
      console.log("   1. Go to MongoDB Atlas → Network Access");
      console.log('   2. Click "Add IP Address"');
      console.log('   3. Click "Allow Access from Anywhere" (adds 0.0.0.0/0)');
      console.log("   4. Confirm and wait 2 minutes\n");
    } else {
      console.error("Error:", error.message);
      console.log("\n💡 General Solutions:");
      console.log("   1. Check MongoDB Atlas is accessible");
      console.log("   2. Verify all parts of connection string are correct");
      console.log(
        "   3. Try creating a new database user with simple credentials\n"
      );
    }

    console.error("📄 Full error details:", error.name);
    process.exit(1);
  });
