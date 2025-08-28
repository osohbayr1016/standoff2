const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const ProPlayer = require("./dist/models/ProPlayer");
const User = require("./dist/models/User");

// Test data
const testProPlayer = {
  userId: "507f1f77bcf86cd799439011", // This will be replaced with a real user ID
  game: "Mobile Legends: Bang Bang",
  rank: "Mythic",
  currentRank: "Epic",
  targetRank: "Legend",
  price: 50,
  estimatedTime: "3-5 days",
  description:
    "Professional MLBB player with 3 years of experience. Specialized in tank and support roles. Fast and reliable boosting service with 100% success rate.",
  status: "PENDING",
};

async function testProPlayerSystem() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log("❌ No users found in database. Please create a user first.");
      return;
    }

    console.log(`👤 Using test user: ${testUser.name} (${testUser.email})`);

    // Test 1: Create a pro player profile
    console.log("\n🧪 Test 1: Creating pro player profile...");
    const proPlayerData = { ...testProPlayer, userId: testUser._id };
    const newProPlayer = new ProPlayer(proPlayerData);
    const savedProPlayer = await newProPlayer.save();
    console.log("✅ Pro player profile created:", savedProPlayer._id);

    // Test 2: Find pro player by ID
    console.log("\n🧪 Test 2: Finding pro player by ID...");
    const foundProPlayer = await ProPlayer.findById(savedProPlayer._id);
    console.log(
      "✅ Pro player found:",
      foundProPlayer.game,
      "-",
      foundProPlayer.status
    );

    // Test 3: Update pro player status
    console.log("\n🧪 Test 3: Updating pro player status...");
    const updatedProPlayer = await ProPlayer.findByIdAndUpdate(
      savedProPlayer._id,
      { status: "APPROVED", approvedBy: testUser._id, approvedAt: new Date() },
      { new: true }
    );
    console.log("✅ Pro player status updated:", updatedProPlayer.status);

    // Test 4: Find approved pro players
    console.log("\n🧪 Test 4: Finding approved pro players...");
    const approvedPlayers = await ProPlayer.find({ status: "APPROVED" });
    console.log("✅ Found", approvedPlayers.length, "approved pro players");

    // Test 5: Find pending applications
    console.log("\n🧪 Test 5: Finding pending applications...");
    const pendingApplications = await ProPlayer.find({ status: "PENDING" });
    console.log("✅ Found", pendingApplications.length, "pending applications");

    // Test 6: Get pro player stats
    console.log("\n🧪 Test 6: Getting pro player statistics...");
    const stats = await ProPlayer.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBoosts: { $sum: "$totalBoosts" },
          successfulBoosts: { $sum: "$successfulBoosts" },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);
    console.log("✅ Pro player stats:", stats);

    // Cleanup: Delete test data
    console.log("\n🧹 Cleaning up test data...");
    await ProPlayer.findByIdAndDelete(savedProPlayer._id);
    console.log("✅ Test data cleaned up");

    console.log("\n🎉 All tests passed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Pro player model: ✅ Working");
    console.log("- CRUD operations: ✅ Working");
    console.log("- Status management: ✅ Working");
    console.log("- Aggregation queries: ✅ Working");
    console.log("- Database connections: ✅ Working");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run tests
if (require.main === module) {
  testProPlayerSystem();
}

module.exports = testProPlayerSystem;
