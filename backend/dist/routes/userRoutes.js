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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importStar(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/players", async (req, res) => {
    try {
        const players = await User_1.default.find({ role: User_1.UserRole.PLAYER })
            .select("id name email avatar role isVerified isOnline")
            .lean();
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
        const user = await User_1.default.findById(userId)
            .select("id email name avatar bio gameExpertise hourlyRate rating totalReviews isVerified isOnline lastSeen role createdAt updatedAt")
            .lean();
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
        const { name, avatar, bio, gameExpertise, hourlyRate } = req.body;
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
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, updateData, {
            new: true,
            select: "id email name avatar bio gameExpertise hourlyRate rating totalReviews isVerified isOnline lastSeen role createdAt updatedAt",
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
