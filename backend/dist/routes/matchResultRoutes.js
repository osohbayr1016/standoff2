"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const MatchResult_1 = __importDefault(require("../models/MatchResult"));
const MatchLobby_1 = __importDefault(require("../models/MatchLobby"));
const auth_1 = require("../middleware/auth");
const stream_1 = require("stream");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder,
            resource_type: "image",
            transformation: [
                { width: 1920, height: 1080, crop: "limit" },
                { quality: "auto:good" },
            ],
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve(result.secure_url);
            }
            else {
                reject(new Error("Upload failed"));
            }
        });
        const readable = stream_1.Readable.from(buffer);
        readable.pipe(uploadStream);
    });
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
            const userId = request.user.id;
            const parts = request.parts();
            const files = [];
            let lobbyId;
            for await (const part of parts) {
                if (part.type === "file") {
                    if (!ALLOWED_TYPES.includes(part.mimetype)) {
                        return reply.status(400).send({
                            success: false,
                            message: `Invalid file type: ${part.mimetype}. Only JPG, PNG, and WEBP are allowed.`,
                        });
                    }
                    const buffer = await part.toBuffer();
                    if (buffer.length > MAX_FILE_SIZE) {
                        return reply.status(400).send({
                            success: false,
                            message: "File too large. Maximum size is 5MB.",
                        });
                    }
                    files.push(buffer);
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
            const uploadPromises = files.map((buffer) => uploadToCloudinary(buffer, `match-results/${lobbyId}`));
            const imageUrls = await Promise.all(uploadPromises);
            return reply.send({
                success: true,
                data: { imageUrls },
            });
        }
        catch (error) {
            console.error("Upload error:", error);
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
                submittedAt: new Date(),
            });
            lobby.status = "RESULT_SUBMITTED";
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
