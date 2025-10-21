const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/e-sport-connection";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

async function checkSquads() {
  try {
    await connectDB();

    // Import models
    const Squad = require("./dist/models/Squad").default;

    console.log("🔄 Finding all squads...");

    // Find all squads
    const squads = await Squad.find({})
      .populate("leader", "name email")
      .populate("members", "name email");

    console.log(`📊 Found ${squads.length} squads:`);

    squads.forEach((squad, index) => {
      console.log(`\n${index + 1}. Squad: ${squad.name}`);
      console.log(`   ID: ${squad._id}`);
      console.log(`   Leader: ${squad.leader.name}`);
      console.log(`   Members: ${squad.members.length}`);
      console.log(`   Members: ${squad.members.map((m) => m.name).join(", ")}`);
    });
  } catch (error) {
    console.error("❌ Error checking squads:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
checkSquads();
