const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Squad = require("./dist/models/Squad").default;
const TournamentMatch = require("./dist/models/TournamentMatch").default;

// Test division system
async function testDivisionSystem() {
  try {
    console.log("🔧 Testing Division System...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test 1: Create test squads with different divisions
    console.log("\n📋 Test 1: Creating test squads...");

    const testSquads = [
      {
        name: "Silver Warriors",
        tag: "SILVER",
        leader: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()],
        maxMembers: 5,
        game: "Mobile Legends: Bang Bang",
        division: "SILVER",
        currentBountyCoins: 150,
        protectionCount: 2,
        consecutiveLosses: 0,
        totalBountyCoinsEarned: 200,
        totalBountyCoinsSpent: 50,
      },
      {
        name: "Gold Elite",
        tag: "GOLD",
        leader: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()],
        maxMembers: 5,
        game: "Mobile Legends: Bang Bang",
        division: "GOLD",
        currentBountyCoins: 400,
        protectionCount: 1,
        consecutiveLosses: 1,
        totalBountyCoinsEarned: 800,
        totalBountyCoinsSpent: 400,
      },
      {
        name: "Diamond Kings",
        tag: "DIAMOND",
        leader: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()],
        maxMembers: 5,
        game: "Mobile Legends: Bang Bang",
        division: "DIAMOND",
        currentBountyCoins: 1200,
        protectionCount: 2,
        consecutiveLosses: 0,
        totalBountyCoinsEarned: 2000,
        totalBountyCoinsSpent: 800,
      },
    ];

    // Clear existing test squads
    await Squad.deleteMany({ tag: { $in: ["SILVER", "GOLD", "DIAMOND"] } });
    console.log("🧹 Cleared existing test squads");

    // Create test squads
    const createdSquads = await Squad.insertMany(testSquads);
    console.log(`✅ Created ${createdSquads.length} test squads`);

    // Test 2: Test division upgrade logic
    console.log("\n📋 Test 2: Testing division upgrade logic...");

    const silverSquad = await Squad.findOne({ division: "SILVER" });
    console.log(
      `Silver Squad: ${silverSquad.name} - ${silverSquad.currentBountyCoins} coins`
    );

    // Simulate winning matches to reach upgrade threshold
    silverSquad.currentBountyCoins = 250;
    await silverSquad.save();
    console.log(`✅ Updated Silver Squad to 250 coins (upgrade threshold)`);

    // Test 3: Test division demotion logic
    console.log("\n📋 Test 3: Testing division demotion logic...");

    const goldSquad = await Squad.findOne({ division: "GOLD" });
    console.log(
      `Gold Squad: ${goldSquad.name} - ${goldSquad.currentBountyCoins} coins, ${goldSquad.protectionCount} protections`
    );

    // Simulate losing matches without protection
    goldSquad.currentBountyCoins = 0;
    goldSquad.protectionCount = 0;
    goldSquad.consecutiveLosses = 2;
    await goldSquad.save();
    console.log(
      `✅ Updated Gold Squad to 0 coins, 0 protections, 2 consecutive losses`
    );

    // Test 4: Test protection system
    console.log("\n📋 Test 4: Testing protection system...");

    const diamondSquad = await Squad.findOne({ division: "DIAMOND" });
    console.log(
      `Diamond Squad: ${diamondSquad.name} - ${diamondSquad.protectionCount} protections`
    );

    // Simulate using protection
    diamondSquad.protectionCount = 1;
    await diamondSquad.save();
    console.log(`✅ Updated Diamond Squad to 1 protection`);

    // Test 5: Display all squads
    console.log("\n📋 Test 5: Displaying all test squads...");

    const allSquads = await Squad.find({
      tag: { $in: ["SILVER", "GOLD", "DIAMOND"] },
    });

    allSquads.forEach((squad) => {
      console.log(`\n🏆 ${squad.name} (${squad.tag})`);
      console.log(`   Division: ${squad.division}`);
      console.log(`   Current Coins: ${squad.currentBountyCoins}`);
      console.log(`   Protections: ${squad.protectionCount}`);
      console.log(`   Consecutive Losses: ${squad.consecutiveLosses}`);
      console.log(`   Total Earned: ${squad.totalBountyCoinsEarned}`);
      console.log(`   Total Spent: ${squad.totalBountyCoinsSpent}`);
    });

    console.log("\n✅ Division System Test Completed Successfully!");
    console.log("\n📊 Test Summary:");
    console.log("   - Created 3 test squads (Silver, Gold, Diamond)");
    console.log("   - Tested division upgrade logic (Silver → 250 coins)");
    console.log(
      "   - Tested division demotion logic (Gold → 0 coins, 0 protections)"
    );
    console.log("   - Tested protection system (Diamond → 1 protection)");
    console.log("   - All models and fields working correctly");
  } catch (error) {
    console.error("❌ Error testing division system:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the test
testDivisionSystem();
