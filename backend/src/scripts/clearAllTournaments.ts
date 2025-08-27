import mongoose from "mongoose";
import Tournament from "../models/Tournament";
import dotenv from "dotenv";

dotenv.config();

async function clearAllTournaments() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Get count before deletion
    const countBefore = await Tournament.countDocuments();
    console.log(`📊 Found ${countBefore} tournaments in database`);

    if (countBefore === 0) {
      console.log("ℹ️ No tournaments found to delete");
      return;
    }

    // Delete all tournaments
    const result = await Tournament.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} tournaments`);

    // Verify deletion
    const countAfter = await Tournament.countDocuments();
    console.log(`📊 Remaining tournaments: ${countAfter}`);

    if (countAfter === 0) {
      console.log("✅ All tournaments successfully removed!");
    } else {
      console.log("⚠️ Some tournaments may still exist");
    }
  } catch (error) {
    console.error("❌ Error clearing tournaments:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
clearAllTournaments();
