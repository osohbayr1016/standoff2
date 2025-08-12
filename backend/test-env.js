#!/usr/bin/env node

console.log("🧪 Testing Environment Configuration");
console.log("====================================");

// Load environment variables
require('dotenv').config();

// Check environment variables
console.log("\n📋 Environment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("PORT:", process.env.PORT || "not set (will use 8000)");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "set" : "not set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "set" : "not set");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "set" : "not set");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "not set");

// Test basic imports
console.log("\n📦 Testing Imports:");
try {
    const express = require('express');
    console.log("✅ Express imported successfully");
} catch (error) {
    console.log("❌ Express import failed:", error.message);
}

try {
    const mongoose = require('mongoose');
    console.log("✅ Mongoose imported successfully");
} catch (error) {
    console.log("❌ Mongoose import failed:", error.message);
}

try {
    const cors = require('cors');
    console.log("✅ CORS imported successfully");
} catch (error) {
    console.log("❌ CORS import failed:", error.message);
}

// Test file system
console.log("\n📁 Testing File System:");
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'dist', 'index.js'))) {
    console.log("✅ dist/index.js exists");
} else {
    console.log("❌ dist/index.js not found");
}

if (fs.existsSync(path.join(__dirname, 'package.json'))) {
    console.log("✅ package.json exists");
} else {
    console.log("❌ package.json not found");
}

console.log("\n🎯 Environment test completed!");
