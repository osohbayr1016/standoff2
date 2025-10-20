import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    console.log("🔄 Attempting to connect to MongoDB...");

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error);

    // Provide helpful error messages
    if (error.message?.includes("bad auth")) {
      console.error(
        "\n🔐 Authentication Error: Check your MongoDB credentials"
      );
      console.error("💡 Solutions:");
      console.error("   1. Verify username and password in MONGODB_URI");
      console.error("   2. Check MongoDB Atlas → Database Access");
      console.error("   3. Ensure user has proper permissions");
      console.error("   4. URL encode special characters in password\n");
    } else if (error.message?.includes("ENOTFOUND")) {
      console.error("\n🌐 Network Error: Cannot reach MongoDB cluster");
      console.error("💡 Check your connection string format\n");
    }

    process.exit(1);
  }
};

export default connectDB;
