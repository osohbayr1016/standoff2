"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const userRoutes = async (fastify) => {
    fastify.get("/", { preHandler: [auth_1.authenticateToken] }, async (request, reply) => {
        try {
            const user = request.user;
            if (user?.role !== "ADMIN") {
                return reply.status(403).send({
                    success: false,
                    message: "Admin only",
                });
            }
            const users = await User_1.default.find({})
                .select("-password")
                .sort({ createdAt: -1 })
                .lean();
            return reply.send({
                success: true,
                users: users.map((u) => ({
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    avatar: u.avatar,
                    isVerified: u.isVerified || false,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                })),
            });
        }
        catch (error) {
            console.error("Error fetching users:", error);
            return reply.status(500).send({
                success: false,
                message: "Internal server error",
            });
        }
    });
    fastify.post("/", { preHandler: [auth_1.authenticateToken] }, async (request, reply) => {
        try {
            const user = request.user;
            if (user?.role !== "ADMIN") {
                return reply.status(403).send({
                    success: false,
                    message: "Admin only",
                });
            }
            const { name, email, password, role, isVerified } = request.body;
            if (!name || !email || !password || !role) {
                return reply.status(400).send({
                    success: false,
                    message: "Name, email, password, and role are required",
                });
            }
            const validRoles = ["PLAYER", "COACH", "ORGANIZATION", "ADMIN", "MODERATOR"];
            if (!validRoles.includes(role)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid role. Must be one of: PLAYER, COACH, ORGANIZATION, ADMIN, MODERATOR",
                });
            }
            const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return reply.status(400).send({
                    success: false,
                    message: "User with this email already exists",
                });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const newUser = new User_1.default({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                isVerified: isVerified || false,
            });
            await newUser.save();
            return reply.status(201).send({
                success: true,
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    isVerified: newUser.isVerified,
                },
            });
        }
        catch (error) {
            console.error("Error creating user:", error);
            return reply.status(500).send({
                success: false,
                message: "Internal server error",
            });
        }
    });
    fastify.patch("/:id", { preHandler: [auth_1.authenticateToken] }, async (request, reply) => {
        try {
            const user = request.user;
            if (user?.role !== "ADMIN") {
                return reply.status(403).send({
                    success: false,
                    message: "Admin only",
                });
            }
            const { id } = request.params;
            const { name, email, password, role, isVerified } = request.body;
            const existingUser = await User_1.default.findById(id);
            if (!existingUser) {
                return reply.status(404).send({
                    success: false,
                    message: "User not found",
                });
            }
            if (name)
                existingUser.name = name;
            if (email)
                existingUser.email = email.toLowerCase();
            if (role) {
                const validRoles = ["PLAYER", "COACH", "ORGANIZATION", "ADMIN", "MODERATOR"];
                if (!validRoles.includes(role)) {
                    return reply.status(400).send({
                        success: false,
                        message: "Invalid role",
                    });
                }
                existingUser.role = role;
            }
            if (typeof isVerified === "boolean")
                existingUser.isVerified = isVerified;
            if (password) {
                existingUser.password = await bcryptjs_1.default.hash(password, 10);
            }
            await existingUser.save();
            return reply.send({
                success: true,
                message: "User updated successfully",
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    isVerified: existingUser.isVerified,
                },
            });
        }
        catch (error) {
            console.error("Error updating user:", error);
            return reply.status(500).send({
                success: false,
                message: "Internal server error",
            });
        }
    });
    fastify.delete("/:id", { preHandler: [auth_1.authenticateToken] }, async (request, reply) => {
        try {
            const user = request.user;
            if (user?.role !== "ADMIN") {
                return reply.status(403).send({
                    success: false,
                    message: "Admin only",
                });
            }
            const { id } = request.params;
            const deletedUser = await User_1.default.findByIdAndDelete(id);
            if (!deletedUser) {
                return reply.status(404).send({
                    success: false,
                    message: "User not found",
                });
            }
            return reply.send({
                success: true,
                message: "User deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting user:", error);
            return reply.status(500).send({
                success: false,
                message: "Internal server error",
            });
        }
    });
    fastify.put("/update-role", async (request, reply) => {
        try {
            const { email, role } = request.body;
            if (!email || !role) {
                return reply.status(400).send({
                    success: false,
                    message: "Email and role are required",
                });
            }
            const validRoles = ["PLAYER", "COACH", "ORGANIZATION", "ADMIN"];
            if (!validRoles.includes(role)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid role. Must be one of: PLAYER, COACH, ORGANIZATION, ADMIN",
                });
            }
            const user = await User_1.default.findOneAndUpdate({ email: email.toLowerCase() }, { role }, { new: true });
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: "User not found",
                });
            }
            return reply.status(200).send({
                success: true,
                message: `User role updated to ${role}`,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error("Error updating user role:", error);
            return reply.status(500).send({
                success: false,
                message: "Error updating user role",
            });
        }
    });
    fastify.get("/players", async (request, reply) => {
        try {
            const players = await User_1.default.find({ role: "PLAYER" }).limit(50);
            const transformedPlayers = players.map((player) => ({
                id: player._id.toString(),
                name: player.name || "Unknown Player",
                avatar: player.avatar || "/default-avatar.png",
                game: "Mobile Legends: Bang Bang",
                role: "Player",
                rank: "Unranked",
                experience: "New Player",
                description: "Player looking for opportunities",
                isOnline: false,
                isLookingForTeam: true,
            }));
            return {
                success: true,
                players: transformedPlayers,
                count: transformedPlayers.length,
            };
        }
        catch (error) {
            console.error("Error fetching players:", error);
            reply.status(500).send({
                success: false,
                message: "Error fetching players",
                error: process.env.NODE_ENV === "production" ? undefined : error.message,
            });
        }
    });
    fastify.get("/organizations", async (request, reply) => {
        try {
            const organizations = await User_1.default.find({ role: "ORGANIZATION" }).limit(50);
            const transformedOrganizations = organizations.map((org) => ({
                id: org._id.toString(),
                name: org.name || "Unknown Organization",
                avatar: org.avatar || "/default-avatar.png",
                games: ["Mobile Legends: Bang Bang"],
                description: `${org.name || "Unknown Organization"} is a professional esports organization.`,
                founded: 2024,
                achievements: 0,
                isVerified: false,
            }));
            return {
                success: true,
                organizations: transformedOrganizations,
                count: transformedOrganizations.length,
            };
        }
        catch (error) {
            console.error("Error fetching organizations:", error);
            reply.status(500).send({
                success: false,
                message: "Error fetching organizations",
                error: process.env.NODE_ENV === "production" ? undefined : error.message,
            });
        }
    });
    fastify.get("/profile/:userId", async (request, reply) => {
        try {
            const { userId } = request.params;
            const user = await User_1.default.findById(userId);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: "User not found",
                });
            }
            const profile = {
                id: user._id.toString(),
                name: user.name || "Unknown User",
                avatar: user.avatar || "/default-avatar.png",
                role: user.role,
                isVerified: false,
                joinedDate: user.createdAt,
                isOnline: user.isOnline || false,
                lastSeen: user.lastSeen,
                ...(user.role === "USER" && {
                    game: "Standoff 2",
                    playerRole: "Player",
                    rank: "Unranked",
                    experience: "New Player",
                    description: `${user.name || "Player"} is looking for competitive opportunities.`,
                }),
            };
            return {
                success: true,
                user: profile,
                profile,
            };
        }
        catch (error) {
            console.error("Error fetching user profile:", error);
            reply.status(500).send({
                success: false,
                message: "Error fetching user profile",
                error: process.env.NODE_ENV === "production" ? undefined : error.message,
            });
        }
    });
};
exports.default = userRoutes;
