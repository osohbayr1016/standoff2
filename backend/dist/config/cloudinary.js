"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "do4w2eaik",
    api_key: process.env.CLOUDINARY_API_KEY || "175389915545927",
    api_secret: process.env.CLOUDINARY_API_SECRET || "CzHTCF1kUi6J4HlSJ1Dgf5cxIdg",
    secure: true,
});
exports.default = cloudinary_1.v2;
