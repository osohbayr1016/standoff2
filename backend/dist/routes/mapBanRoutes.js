"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapBanService_1 = require("../services/mapBanService");
const auth_1 = require("../middleware/auth");
const mapBanRoutes = async (fastify) => {
    fastify.get("/:lobbyId/status", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { lobbyId } = request.params;
            const status = await mapBanService_1.MapBanService.getMapBanStatus(lobbyId);
            return reply.send({
                success: true,
                data: status,
            });
        }
        catch (error) {
            console.error("Get map ban status error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to get map ban status",
            });
        }
    });
    fastify.post("/:lobbyId/ban", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { lobbyId } = request.params;
            const { mapName } = request.body;
            if (!mapName) {
                return reply.status(400).send({
                    success: false,
                    message: "Map name is required",
                });
            }
            const lobby = await mapBanService_1.MapBanService.banMap(lobbyId, userId, mapName);
            return reply.send({
                success: true,
                message: "Map banned successfully",
                data: {
                    availableMaps: lobby.availableMaps,
                    bannedMaps: lobby.bannedMaps,
                    selectedMap: lobby.selectedMap,
                    currentBanTeam: lobby.currentBanTeam,
                    mapBanPhase: lobby.mapBanPhase,
                },
            });
        }
        catch (error) {
            console.error("Ban map error:", error);
            return reply.status(400).send({
                success: false,
                message: error.message || "Failed to ban map",
            });
        }
    });
    fastify.get("/:lobbyId/leaders", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { lobbyId } = request.params;
            const status = await mapBanService_1.MapBanService.getMapBanStatus(lobbyId);
            return reply.send({
                success: true,
                data: {
                    teamAlphaLeader: status.teamAlphaLeader,
                    teamBravoLeader: status.teamBravoLeader,
                    currentBanTeam: status.currentBanTeam,
                },
            });
        }
        catch (error) {
            console.error("Get leaders error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to get team leaders",
            });
        }
    });
};
exports.default = mapBanRoutes;
