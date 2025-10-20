"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const News_1 = __importDefault(require("../models/News"));
const Tournament_1 = __importDefault(require("../models/Tournament"));
const statsRoutes = async (fastify) => {
    fastify.get("/stats/health", async (request, reply) => {
        return {
            success: true,
            message: "Stats routes available",
            timestamp: new Date().toISOString(),
        };
    });
    fastify.get("/stats/overview", async (request, reply) => {
        try {
            const activePlayers = await User_1.default.countDocuments({
                $or: [
                    { isOnline: true },
                    { lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                ],
            });
            const newsCount = await News_1.default.countDocuments();
            const ongoingTournaments = await Tournament_1.default.countDocuments({
                status: "ongoing",
            });
            return {
                activePlayers,
                newsCount,
                ongoingTournaments,
            };
        }
        catch (error) {
            console.error("Error fetching stats overview:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to fetch stats overview",
            });
        }
    });
};
exports.default = statsRoutes;
