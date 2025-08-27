"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const getRandomGame = () => {
    const games = [
        "Valorant",
        "CS:GO",
        "League of Legends",
        "Dota 2",
        "Overwatch",
    ];
    return games[Math.floor(Math.random() * games.length)];
};
const getRandomRole = () => {
    const roles = ["Tank", "DPS", "Support", "IGL", "Entry Fragger"];
    return roles[Math.floor(Math.random() * roles.length)];
};
const getRandomRank = () => {
    const ranks = ["Gold", "Platinum", "Diamond", "Master", "Grandmaster"];
    return ranks[Math.floor(Math.random() * ranks.length)];
};
const getRandomDescription = (name) => {
    const descriptions = [
        `${name} is a dedicated esports enthusiast with exceptional skills.`,
        `Experienced player looking for competitive opportunities.`,
        `Strategic minded player with leadership qualities.`,
        `Skilled in multiple games and always eager to improve.`,
        `Team player with excellent communication skills.`,
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
};
const userRoutes = async (fastify) => {
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
            const mockPlayers = [
                { id: "1", name: "Player One" },
                { id: "2", name: "Player Two" },
                { id: "3", name: "Player Three" },
            ];
            const transformedPlayers = mockPlayers.map((player) => ({
                id: player.id,
                name: player.name,
                avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`,
                game: getRandomGame(),
                role: getRandomRole(),
                rank: getRandomRank(),
                experience: `${Math.floor(Math.random() * 10) + 1}+ years`,
                description: getRandomDescription(player.name || "Player"),
                isOnline: Math.random() > 0.3,
                isLookingForTeam: Math.random() > 0.4,
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
            const mockOrgs = [
                { id: "1", name: "Team Alpha" },
                { id: "2", name: "Beta Gaming" },
            ];
            const transformedOrganizations = mockOrgs.map((org) => ({
                id: org.id,
                name: org.name,
                avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`,
                games: [getRandomGame(), getRandomGame()],
                description: `${org.name} is a professional esports organization.`,
                founded: 2020 + Math.floor(Math.random() * 4),
                achievements: Math.floor(Math.random() * 50) + 1,
                isVerified: Math.random() > 0.5,
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
            const mockUser = {
                id: userId,
                name: `User ${userId}`,
                role: Math.random() > 0.5 ? "PLAYER" : "ORGANIZATION",
                isVerified: Math.random() > 0.5,
                createdAt: new Date(),
            };
            const profile = {
                id: mockUser.id,
                name: mockUser.name,
                avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`,
                role: mockUser.role,
                isVerified: mockUser.isVerified,
                joinedDate: mockUser.createdAt,
                ...(mockUser.role === "PLAYER" && {
                    game: getRandomGame(),
                    playerRole: getRandomRole(),
                    rank: getRandomRank(),
                    experience: `${Math.floor(Math.random() * 10) + 1}+ years`,
                    description: getRandomDescription(mockUser.name || "Player"),
                }),
                ...(mockUser.role === "ORGANIZATION" && {
                    games: [getRandomGame(), getRandomGame()],
                    founded: 2020 + Math.floor(Math.random() * 4),
                    achievements: Math.floor(Math.random() * 50) + 1,
                    description: `${mockUser.name} is a professional esports organization.`,
                }),
            };
            return {
                success: true,
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
