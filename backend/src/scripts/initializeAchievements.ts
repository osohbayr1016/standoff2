import mongoose from "mongoose";
import Achievement from "../models/Achievement";
import Badge from "../models/Badge";

async function initializeAchievements() {
  try {
    console.log("🚀 Initializing achievement system...");

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Clear existing achievements and badges (optional - only if you want to reset)
    // await Achievement.deleteMany({});
    // await Badge.deleteMany({});
    // console.log("🧹 Cleared existing achievements and badges");

    console.log("✅ Achievement system initialized successfully!");
    console.log("📝 Note: Achievements and badges will be created by admins through the admin panel");

  } catch (error) {
    console.error("❌ Error initializing achievement system:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeAchievements();
}

export default initializeAchievements;