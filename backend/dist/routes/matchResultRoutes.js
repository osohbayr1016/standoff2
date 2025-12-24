"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const MatchResult_1 = __importStar(require("../models/MatchResult"));
const MatchLobby_1 = __importStar(require("../models/MatchLobby"));
const auth_1 = require("../middleware/auth");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const isCloudinaryConfigured = () => {
    return (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET);
};
const uploadToCloudinary = async (buffer, mimetype, folder) => {
    try {
        const base64Image = buffer.toString("base64");
        const dataURI = `data:${mimetype};base64,${base64Image}`;
        const uploadOptions = {
            folder,
            resource_type: "image",
            timeout: 60000,
        };
        console.log(`📤 Uploading to Cloudinary with options:`, JSON.stringify(uploadOptions));
        const uploadResult = await cloudinary_1.default.uploader.upload(dataURI, uploadOptions);
        console.log(`✅ Successfully uploaded to Cloudinary: ${uploadResult.secure_url}`);
        return uploadResult.secure_url;
    }
    catch (error) {
        console.error("❌ Cloudinary upload error:", error);
        throw new Error(error.message || "Failed to upload to Cloudinary");
    }
};
const matchResultRoutes = async (fastify) => {
    await fastify.register(multipart_1.default, {
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: 4,
        },
    });
    fastify.post("/upload", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            console.log("📸 Match result upload request received");
            if (!isCloudinaryConfigured()) {
                console.log("❌ Cloudinary not configured");
                return reply.status(503).send({
                    success: false,
                    message: "Image upload service is not configured. Please contact administrator.",
                });
            }
            const userId = request.user.id;
            console.log(`🔑 User authenticated: ${userId}`);
            const parts = request.parts();
            const files = [];
            let lobbyId;
            for await (const part of parts) {
                if (part.type === "file") {
                    console.log(`📁 Processing file: ${part.filename}, type: ${part.mimetype}`);
                    if (!ALLOWED_TYPES.includes(part.mimetype)) {
                        console.log(`❌ Invalid file type: ${part.mimetype}`);
                        return reply.status(400).send({
                            success: false,
                            message: `Invalid file type: ${part.mimetype}. Only JPG, PNG, and WEBP are allowed.`,
                        });
                    }
                    const buffer = await part.toBuffer();
                    console.log(`📊 File buffer size: ${buffer.length} bytes`);
                    if (buffer.length === 0) {
                        return reply.status(400).send({
                            success: false,
                            message: "File appears to be empty or corrupted",
                        });
                    }
                    if (buffer.length > MAX_FILE_SIZE) {
                        const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
                        return reply.status(400).send({
                            success: false,
                            message: `File too large. Maximum size is ${maxSizeMB}MB.`,
                        });
                    }
                    files.push({ buffer, mimetype: part.mimetype });
                }
                else {
                    if (part.fieldname === "lobbyId") {
                        lobbyId = part.value;
                    }
                }
            }
            if (files.length < 2) {
                return reply.status(400).send({
                    success: false,
                    message: "At least 2 images are required",
                });
            }
            if (files.length > 4) {
                return reply.status(400).send({
                    success: false,
                    message: "Maximum 4 images allowed",
                });
            }
            if (!lobbyId) {
                return reply.status(400).send({
                    success: false,
                    message: "Lobby ID is required",
                });
            }
            console.log(`📤 Uploading ${files.length} images to Cloudinary for lobby ${lobbyId}`);
            const uploadPromises = files.map((file, index) => {
                console.log(`📤 Uploading image ${index + 1}/${files.length}`);
                return uploadToCloudinary(file.buffer, file.mimetype, `match-results/${lobbyId}`);
            });
            const imageUrls = await Promise.all(uploadPromises);
            console.log(`✅ Successfully uploaded ${imageUrls.length} images`);
            return reply.send({
                success: true,
                data: { imageUrls },
            });
        }
        catch (error) {
            console.error("Upload error:", error);
            console.error("Error stack:", error.stack);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to upload images",
            });
        }
    });
    fastify.post("/:lobbyId/submit", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { lobbyId } = request.params;
            const { imageUrls } = request.body;
            if (!imageUrls || !Array.isArray(imageUrls)) {
                return reply.status(400).send({
                    success: false,
                    message: "Image URLs are required",
                });
            }
            if (imageUrls.length < 2 || imageUrls.length > 4) {
                return reply.status(400).send({
                    success: false,
                    message: "Must have between 2 and 4 images",
                });
            }
            const lobby = await MatchLobby_1.default.findById(lobbyId);
            if (!lobby) {
                return reply.status(404).send({
                    success: false,
                    message: "Lobby not found",
                });
            }
            const isPlayerInLobby = lobby.players.some((player) => player.userId.toString() === userId);
            if (!isPlayerInLobby) {
                return reply.status(403).send({
                    success: false,
                    message: "You are not a player in this lobby",
                });
            }
            const existingResult = await MatchResult_1.default.findOne({ matchLobbyId: lobbyId });
            if (existingResult) {
                return reply.status(400).send({
                    success: false,
                    message: "Result already submitted for this match",
                });
            }
            const matchResult = await MatchResult_1.default.create({
                matchLobbyId: lobbyId,
                submittedBy: userId,
                screenshots: imageUrls,
                status: MatchResult_1.ResultStatus.PENDING,
                submittedAt: new Date(),
            });
            console.log(`✅ Match result created with ID: ${matchResult._id}, Status: ${matchResult.status}`);
            lobby.status = MatchLobby_1.LobbyStatus.RESULT_SUBMITTED;
            await lobby.save();
            return reply.send({
                success: true,
                message: "Match result submitted successfully",
                data: {
                    resultId: matchResult._id,
                    status: matchResult.status,
                },
            });
        }
        catch (error) {
            console.error("Submit result error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to submit result",
            });
        }
    });
    fastify.get("/:lobbyId", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { lobbyId } = request.params;
            const result = await MatchResult_1.default.findOne({ matchLobbyId: lobbyId })
                .populate("submittedBy", "name email")
                .populate("reviewedBy", "name email")
                .lean();
            if (!result) {
                return reply.status(404).send({
                    success: false,
                    message: "No result found for this lobby",
                });
            }
            return reply.send({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Get result error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to get result",
            });
        }
    });
};
exports.default = matchResultRoutes;
