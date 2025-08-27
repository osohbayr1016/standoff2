"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
const playerProfileRoutes = async (fastify) => {
    fastify.get("/health", async (request, reply) => {
        return reply.send({
            success: true,
            message: "Player profile routes available",
            timestamp: new Date().toISOString(),
        });
    });
    fastify.get("/test", async (request, reply) => {
        return reply.send({
            success: true,
            message: "Player profile routes are working",
            timestamp: new Date().toISOString(),
        });
    });
    fastify.post("/create-profile", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return reply.status(401).send({
                    success: false,
                    message: "Invalid token",
                });
            }
            const profileData = request.body;
            console.log("🔍 Debug - Creating profile for user:", decoded.id);
            console.log("🔍 Debug - Profile data received:", profileData);
            const requiredFields = [
                "category",
                "game",
                "roles",
                "inGameName",
                "rank",
                "experience",
                "bio",
            ];
            const missingFields = requiredFields.filter((field) => !profileData[field]);
            if (missingFields.length > 0) {
                console.log("🔍 Debug - Missing required fields:", missingFields);
                return reply.status(400).send({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                    missingFields,
                });
            }
            const existingProfile = await PlayerProfile_1.default.findOne({
                userId: decoded.id,
            });
            if (existingProfile) {
                return reply.status(400).send({
                    success: false,
                    message: "Profile already exists",
                });
            }
            const newProfile = new PlayerProfile_1.default({
                userId: decoded.id,
                ...profileData,
            });
            console.log("🔍 Debug - Profile object to save:", newProfile);
            await newProfile.save();
            console.log("🔍 Debug - Profile saved successfully:", newProfile._id);
            return reply.status(201).send({
                success: true,
                message: "Profile created successfully",
                profile: newProfile,
            });
        }
        catch (error) {
            console.error("Create profile error:", error);
            if (error.name === "ValidationError") {
                const validationErrors = Object.values(error.errors).map((err) => err.message);
                return reply.status(400).send({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors,
                });
            }
            return reply.status(500).send({
                success: false,
                message: "Failed to create profile",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    });
    fastify.get("/my-profile", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return reply.status(401).send({
                    success: false,
                    message: "Invalid token",
                });
            }
            const profile = await PlayerProfile_1.default.findOne({ userId: decoded.id });
            if (!profile) {
                return reply.status(404).send({
                    success: false,
                    message: "Profile not found",
                });
            }
            return reply.status(200).send({
                success: true,
                profile,
            });
        }
        catch (error) {
            console.error("Get profile error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get profile",
            });
        }
    });
    fastify.put("/update-profile", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return reply.status(401).send({
                    success: false,
                    message: "Invalid token",
                });
            }
            const updateData = request.body;
            const profile = await PlayerProfile_1.default.findOneAndUpdate({ userId: decoded.id }, updateData, { new: true, runValidators: true });
            if (!profile) {
                return reply.status(404).send({
                    success: false,
                    message: "Profile not found",
                });
            }
            return reply.status(200).send({
                success: true,
                message: "Profile updated successfully",
                profile,
            });
        }
        catch (error) {
            console.error("Update profile error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to update profile",
            });
        }
    });
    fastify.get("/has-profile", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return reply.status(401).send({
                    success: false,
                    message: "Invalid token",
                });
            }
            const profile = await PlayerProfile_1.default.findOne({ userId: decoded.id });
            return reply.status(200).send({
                success: true,
                hasProfile: !!profile,
            });
        }
        catch (error) {
            console.error("Check profile error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to check profile",
            });
        }
    });
    fastify.get("/profiles", async (request, reply) => {
        try {
            const profiles = await PlayerProfile_1.default.find({}).populate("userId", "name email");
            return reply.status(200).send({
                success: true,
                profiles,
            });
        }
        catch (error) {
            console.error("Get profiles error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get profiles",
            });
        }
    });
    fastify.get("/profiles/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            console.log("🔍 Backend: Fetching profile with ID:", id);
            if (!id || id.length !== 24) {
                console.log("🔍 Backend: Invalid ID format:", id);
                return reply.status(400).send({
                    success: false,
                    message: "Invalid profile ID format",
                });
            }
            const profile = await PlayerProfile_1.default.findById(id).populate("userId", "name email");
            console.log("🔍 Backend: Profile found:", profile ? "Yes" : "No");
            if (!profile) {
                return reply.status(404).send({
                    success: false,
                    message: "Profile not found",
                });
            }
            return reply.status(200).send({
                success: true,
                profile,
            });
        }
        catch (error) {
            console.error("Get profile by ID error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get profile",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    });
};
exports.default = playerProfileRoutes;
