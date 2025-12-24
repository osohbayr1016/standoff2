"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const lobbyService_1 = require("../services/lobbyService");
const mongoose_1 = __importDefault(require("mongoose"));
const lobbyRoutes = async (fastify) => {
    console.log("📋 Registering lobby routes...");
    fastify.post("/create", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { map, link } = request.body;
            if (!map || !link) {
                return reply.status(400).send({
                    success: false,
                    message: "Map and Link are required",
                });
            }
            const lobby = await lobbyService_1.LobbyService.createLobby(userId, map, link);
            return reply.send({
                success: true,
                data: lobby,
            });
        }
        catch (error) {
            console.error("Create lobby error:", error);
            return reply.status(500).send({
                success: false,
                message: error.message || "Failed to create lobby",
            });
        }
    });
    console.log("  ✅ POST /api/lobby/create registered");
    fastify.get("/active", async (request, reply) => {
        try {
            const lobbies = await lobbyService_1.LobbyService.getActiveLobbies();
            return reply.send({
                success: true,
                data: lobbies,
            });
        }
        catch (error) {
            console.error("Get active lobbies error:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to get active lobbies",
            });
        }
    });
    console.log("  ✅ GET /api/lobby/active registered (public)");
    fastify.get("/:id", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return reply.status(400).send({ success: false, message: "Invalid lobby ID" });
            }
            const lobby = await lobbyService_1.LobbyService.getLobby(id);
            if (!lobby) {
                return reply.status(404).send({ success: false, message: "Lobby not found" });
            }
            return reply.send({ success: true, data: lobby });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/join", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user.id;
            const lobby = await lobbyService_1.LobbyService.joinLobby(id, userId);
            return reply.send({ success: true, data: lobby });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/team", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user.id;
            const { team } = request.body;
            const lobby = await lobbyService_1.LobbyService.selectTeam(id, userId, team);
            return reply.send({ success: true, data: lobby });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/kick", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const leaderId = request.user.id;
            const { targetUserId } = request.body;
            const lobby = await lobbyService_1.LobbyService.kickPlayer(id, leaderId, targetUserId);
            return reply.send({ success: true, data: lobby });
        }
        catch (error) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    });
    fastify.post("/:id/leave", { preHandler: auth_1.authenticateToken }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user.id;
            await lobbyService_1.LobbyService.leaveLobby(id, userId);
            return reply.send({ success: true, message: "Left lobby successfully" });
        }
        catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
    console.log("✅ All lobby routes registered successfully");
};
exports.default = lobbyRoutes;
