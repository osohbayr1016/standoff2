const { v2: cloudinary } = require("cloudinary");

// Test if cloudinary is working
console.log("Testing Cloudinary import...");
console.log("Cloudinary v2:", typeof cloudinary);
console.log("Cloudinary uploader:", typeof cloudinary.uploader);

// Test the upload routes import
console.log("\nTesting upload routes import...");
try {
  const uploadRoutes = require("./dist/routes/uploadRoutes.js");
  console.log("Upload routes imported:", !!uploadRoutes.default);
  console.log("Upload routes type:", typeof uploadRoutes.default);
} catch (error) {
  console.error("Error importing upload routes:", error.message);
}
