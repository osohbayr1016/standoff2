"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/players", async (req, res) => {
    try {
        const players = await database_1.default.user.findMany({
            where: { role: client_1.UserRole.PLAYER },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                isVerified: true,
                isOnline: true,
            },
        });
        const transformedPlayers = players.map((player) => ({
            id: player.id,
            name: player.name,
            avatar: player.avatar ||
                `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`,
            game: getRandomGame(),
            role: getRandomRole(),
            rank: getRandomRank(),
            experience: `${Math.floor(Math.random() * 10) + 1}+ years`,
            description: getRandomDescription(player.name || "Player"),
            isOnline: Math.random() > 0.3,
            isLookingForTeam: Math.random() > 0.4,
        }));
        res.json({ players: transformedPlayers });
    }
    catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/profile", auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                gameExpertise: true,
                hourlyRate: true,
                rating: true,
                totalReviews: true,
                isVerified: true,
                isOnline: true,
                lastSeen: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ user });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/profile", auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, avatar, bio, gameExpertise, hourlyRate, } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (avatar)
            updateData.avatar = avatar;
        if (bio)
            updateData.bio = bio;
        if (gameExpertise)
            updateData.gameExpertise = gameExpertise;
        if (hourlyRate !== undefined)
            updateData.hourlyRate = hourlyRate;
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                gameExpertise: true,
                hourlyRate: true,
                rating: true,
                totalReviews: true,
                isVerified: true,
                isOnline: true,
                lastSeen: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json({ user: updatedUser });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
function getRandomGame() {
    const games = [
        "Dota 2",
        "CS:GO",
        "League of Legends",
        "Valorant",
        "Overwatch",
    ];
    return games[Math.floor(Math.random() * games.length)];
}
function getRandomRole() {
    const roles = [
        "Carry",
        "Support",
        "Mid",
        "AWPer",
        "IGL",
        "Duelist",
        "Controller",
    ];
    return roles[Math.floor(Math.random() * roles.length)];
}
function getRandomRank() {
    const ranks = [
        "Divine",
        "Ancient",
        "Legend",
        "Global Elite",
        "Supreme",
        "Diamond",
        "Immortal",
    ];
    return ranks[Math.floor(Math.random() * ranks.length)];
}
function getRandomDescription(name) {
    const descriptions = [
        `${name} is a professional player looking for competitive opportunities`,
        `Skilled ${name} with excellent game sense and teamwork`,
        `${name} brings years of experience and strategic thinking`,
        `Aggressive player ${name} with strong mechanical skills`,
        `${name} is known for excellent communication and leadership`,
        `Experienced ${name} with strong map awareness and positioning`,
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}
exports.default = router;
//# sourceMappingURL=userRoutes.js.map