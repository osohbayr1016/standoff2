import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile";
import dotenv from "dotenv";

dotenv.config();

const generateUniqueId = async (inGameName: string, excludeId?: string): Promise<string> => {
  const baseId = (inGameName || "player")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);
  
  if (baseId.length === 0) {
    const randomBase = Math.random().toString(36).substring(2, 10);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `player-${randomBase}-${randomSuffix}`;
  }
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  let uniqueId = `${baseId}-${randomSuffix}`;
  
  let counter = 0;
  while (counter < 20) {
    const existing = await PlayerProfile.findOne({ uniqueId });
    if (!existing || (excludeId && existing._id.toString() === excludeId)) {
      break;
    }
    uniqueId = `${baseId}-${randomSuffix}-${counter}`;
    counter++;
  }
  
  return uniqueId;
};

async function addUniqueIds() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/esport-connection");
    console.log("✅ Connected to MongoDB");

    console.log("🔍 Finding profiles without uniqueId...");
    const profiles = await PlayerProfile.find({
      $or: [
        { uniqueId: null },
        { uniqueId: { $exists: false } },
        { uniqueId: "" }
      ]
    });

    console.log(`📊 Found ${profiles.length} profiles without uniqueId`);

    if (profiles.length === 0) {
      console.log("✅ All profiles already have uniqueIds!");
      process.exit(0);
    }

    console.log("🔨 Adding uniqueIds...");
    let updated = 0;

    for (const profile of profiles) {
      try {
        const uniqueId = await generateUniqueId(profile.inGameName, profile._id.toString());
        profile.uniqueId = uniqueId;
        await profile.save();
        console.log(`✅ Updated profile ${profile.inGameName} with uniqueId: ${uniqueId}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating profile ${profile.inGameName}:`, error);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} out of ${profiles.length} profiles`);
    console.log("✅ Migration complete!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addUniqueIds();

