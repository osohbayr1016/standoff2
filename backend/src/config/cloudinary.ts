import { v2 as cloudinary } from "cloudinary";

// Validate Cloudinary environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "⚠️ Cloudinary environment variables not set. Image upload will be disabled."
  );
  console.warn(
    "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file"
  );
} else {
  }

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
