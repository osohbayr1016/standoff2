"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloudName || !apiKey || !apiSecret) {
    console.warn("⚠️ Cloudinary environment variables not set. Image upload will be disabled.");
    console.warn("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file");
}
else {
}
cloudinary_1.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});
exports.default = cloudinary_1.v2;
