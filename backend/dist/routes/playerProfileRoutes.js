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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
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
            const requiredFields = ["inGameName"];
            const missingFields = requiredFields.filter((field) => !profileData[field]);
            if (missingFields.length > 0) {
                return reply.status(400).send({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                    missingFields,
                });
            }
            profileData.category = profileData.category || "Mobile";
            profileData.game = profileData.game || "Standoff 2";
            profileData.roles = profileData.roles || ["Player"];
            profileData.rank = profileData.rank || "Unranked";
            profileData.experience = profileData.experience || "New Player";
            profileData.bio = profileData.bio || "";
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
            await newProfile.save();
            try {
                const { AchievementService } = await Promise.resolve().then(() => __importStar(require("../services/achievementService")));
                await AchievementService.processAchievementTrigger({
                    userId: decoded.id,
                    type: "profile_update",
                    data: {
                        game: profileData.game,
                        rank: profileData.rank,
                        category: profileData.category,
                    },
                });
            }
            catch (achievementError) {
                console.error("Error processing achievement triggers:", achievementError);
            }
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
            console.log("[My Profile] Request received");
            if (!token) {
                console.log("[My Profile] ERROR: No token provided");
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                console.log("[My Profile] ERROR: Invalid token");
                return reply.status(401).send({
                    success: false,
                    message: "Invalid token",
                });
            }
            console.log(`[My Profile] Looking for profile with userId: ${decoded.id}`);
            const profile = await PlayerProfile_1.default.findOne({
                userId: decoded.id
            }).populate("userId", "name email avatar isOnline").lean();
            if (!profile) {
                console.log(`[My Profile] Profile not found for userId: ${decoded.id}`);
                return reply.status(404).send({
                    success: false,
                    message: "Profile not found",
                });
            }
            console.log(`[My Profile] SUCCESS: Found profile for ${profile.inGameName}`);
            return reply.status(200).send({
                success: true,
                profile,
            });
        }
        catch (error) {
            console.error("[My Profile] EXCEPTION:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get profile",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
            if (updateData.inGameName || updateData.standoff2Id) {
                updateData.isIdVerified = false;
            }
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
            const profiles = await PlayerProfile_1.default.find({})
                .populate("userId", "name email avatar isOnline")
                .select("-friends");
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
    fastify.get("/profiles/unique/:uniqueId", async (request, reply) => {
        try {
            const { uniqueId } = request.params;
            console.log(`[Profile Lookup] Received uniqueId param: "${uniqueId}"`);
            if (!uniqueId) {
                console.log("[Profile Lookup] ERROR: No uniqueId provided");
                return reply.status(400).send({
                    success: false,
                    message: "Unique ID is required",
                });
            }
            console.log(`[Profile Lookup] Searching for profile with uniqueId: "${uniqueId}"`);
            const profile = await PlayerProfile_1.default.findOne({ uniqueId }).populate("userId", "name email avatar isOnline").lean();
            if (!profile) {
                console.log(`[Profile Lookup] Profile not found for uniqueId: ${uniqueId}`);
                return reply.status(404).send({
                    success: false,
                    message: "Profile not found",
                });
            }
            console.log(`[Profile Lookup] SUCCESS: Found profile ${profile.inGameName} by uniqueId`);
            return reply.status(200).send({
                success: true,
                profile,
            });
        }
        catch (error) {
            console.error("Get profile by uniqueId error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get profile",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    });
    fastify.get("/profiles/user/:userId", async (request, reply) => {
        try {
            const { userId } = request.params;
            console.log(`[Profile Lookup] Received userId param: "${userId}"`);
            if (!userId) {
                console.log("[Profile Lookup] ERROR: No userId provided");
                return reply.status(400).send({
                    success: false,
                    message: "User ID is required",
                });
            }
            let profile;
            const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(userId);
            console.log(`[Profile Lookup] Is valid ObjectId: ${isValidObjectId}`);
            if (isValidObjectId) {
                const objectId = new mongoose_1.default.Types.ObjectId(userId);
                console.log(`[Profile Lookup] Searching for profile with userId ObjectId: ${objectId}`);
                profile = await PlayerProfile_1.default.findOne({
                    userId: objectId
                }).populate("userId", "name email avatar isOnline").lean();
                console.log(`[Profile Lookup] Result from ObjectId query: ${profile ? 'FOUND' : 'NOT FOUND'}`);
                if (profile) {
                    console.log(`[Profile Lookup] Found profile: ${profile.inGameName} (profileId: ${profile._id})`);
                }
            }
            if (!profile) {
                console.log(`[Profile Lookup] Trying string match for userId: "${userId}"`);
                profile = await PlayerProfile_1.default.findOne({ userId }).populate("userId", "name email avatar isOnline").lean();
                console.log(`[Profile Lookup] Result from string query: ${profile ? 'FOUND' : 'NOT FOUND'}`);
            }
            if (!profile) {
                console.log(`[Profile Lookup] FINAL RESULT: Profile not found for userId: ${userId}`);
                return reply.status(404).send({
                    success: false,
                    message: "Profile not found for this user ID",
                });
            }
            console.log(`[Profile Lookup] SUCCESS: Returning profile for ${profile.inGameName}`);
            return reply.status(200).send({
                success: true,
                profile,
            });
        }
        catch (error) {
            console.error("[Profile Lookup] EXCEPTION:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get profile",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    });
    fastify.get("/profiles/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            if (id && id.length !== 24) {
                const profileByUniqueId = await PlayerProfile_1.default.findOne({
                    uniqueId: id,
                }).populate("userId", "name email avatar isOnline");
                if (profileByUniqueId) {
                    return reply.status(200).send({
                        success: true,
                        profile: profileByUniqueId,
                    });
                }
            }
            if (!id || id.length !== 24) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid profile ID format",
                });
            }
            const profile = await PlayerProfile_1.default.findById(id).populate("userId", "name email avatar isOnline");
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
