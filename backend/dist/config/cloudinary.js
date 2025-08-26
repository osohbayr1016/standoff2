"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary = {
    uploader: {
        async upload() {
            throw new Error("Cloudinary is disabled");
        },
        async destroy() {
            throw new Error("Cloudinary is disabled");
        },
    },
};
exports.default = cloudinary;
