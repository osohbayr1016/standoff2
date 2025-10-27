import mongoose from "mongoose";
import Achievement from "../models/Achievement";
import Badge from "../models/Badge";
import UserAchievement from "../models/UserAchievement";
import UserBadge from "../models/UserBadge";
import { AchievementService } from "../services/achievementService";

async function testAchievementSystem() {
  try {
    console.log("🧪 Testing Achievement System...");

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Test 1: Check if achievements exist
    const achievements = await Achievement.find({});
    console.log(`📊 Found ${achievements.length} achievements`);

    // Test 2: Check if badges exist
    const badges = await Badge.find({});
    console.log(`🏅 Found ${badges.length} badges`);

    // Test 3: Test achievement trigger
    const testUserId = new mongoose.Types.ObjectId();
    console.log("🎯 Testing achievement trigger...");
    
    await AchievementService.processAchievementTrigger({
      userId: testUserId,
      type: "profile_update",
      data: {
        game: "Mobile Legends: Bang Bang",
        rank: "Epic",
        category: "Mobile",
      },
    });

    // Check if user achievement was created
    const userAchievements = await UserAchievement.find({ userId: testUserId });
    console.log(`✅ Created ${userAchievements.length} user achievements`);

    // Test 4: Test badge creation
    const userBadges = await UserBadge.find({ userId: testUserId });
    console.log(`🏆 Created ${userBadges.length} user badges`);

    console.log("🎉 Achievement system test completed successfully!");

  } catch (error) {
    console.error("❌ Error testing achievement system:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAchievementSystem();
}

export default testAchievementSystem;

