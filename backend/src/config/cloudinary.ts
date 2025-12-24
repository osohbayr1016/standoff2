import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "do4w2eaik",
  api_key: process.env.CLOUDINARY_API_KEY || "175389915545927",
  api_secret: process.env.CLOUDINARY_API_SECRET || "CzHTCF1kUi6J4HlSJ1Dgf5cxIdg",
  secure: true,
});

export default cloudinary;
