#!/usr/bin/env node

import dotenv from "dotenv";
import initializeAchievements from "./initializeAchievements";

// Load environment variables
dotenv.config();

// Run the initialization
initializeAchievements()
  .then(() => {
    console.log("✅ Achievement system initialization completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Achievement system initialization failed:", error);
    process.exit(1);
  });
