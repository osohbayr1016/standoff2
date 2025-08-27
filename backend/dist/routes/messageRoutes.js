"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const messageRoutes = async (fastify) => {
    fastify.get("/messages/health", async (request, reply) => {
        return {
            success: true,
            message: "Message routes available",
            timestamp: new Date().toISOString(),
        };
    });
    fastify.get("/messages/:userId", {
        preHandler: auth_1.authenticateToken,
    }, async (request, reply) => {
        try {
            const { userId } = request.params;
            const currentUserId = request.user?.id;
            if (!currentUserId) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            return reply.send({
                success: true,
                messages: [],
                count: 0,
            });
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to fetch messages",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.post("/messages", {
        preHandler: auth_1.authenticateToken,
    }, async (request, reply) => {
        try {
            const { receiverId, content } = request.body;
            const currentUserId = request.user?.id;
            if (!currentUserId) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            if (!receiverId || !content) {
                return reply.status(400).send({
                    success: false,
                    message: "Receiver ID and content are required",
                });
            }
            if (content.trim().length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: "Message content cannot be empty",
                });
            }
            const message = {
                id: Date.now().toString(),
                content: content.trim(),
                senderId: currentUserId,
                receiverId,
                createdAt: new Date().toISOString(),
                sender: {
                    id: currentUserId,
                    name: request.user?.name || "Unknown",
                    avatar: request.user?.avatar,
                },
                receiver: {
                    id: receiverId,
                    name: "Unknown",
                    avatar: undefined,
                },
            };
            return reply.status(201).send({
                success: true,
                message: "Message sent successfully",
                data: message,
            });
        }
        catch (error) {
            console.error("Error sending message:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to send message",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.post("/messages/read", {
        preHandler: auth_1.authenticateToken,
    }, async (request, reply) => {
        try {
            const { senderId } = request.body;
            const currentUserId = request.user?.id;
            if (!currentUserId) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            if (!senderId) {
                return reply.status(400).send({
                    success: false,
                    message: "Sender ID is required",
                });
            }
            return reply.send({
                success: true,
                message: "Messages marked as read",
            });
        }
        catch (error) {
            console.error("Error marking messages as read:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to mark messages as read",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.get("/messages/unread/count", {
        preHandler: auth_1.authenticateToken,
    }, async (request, reply) => {
        try {
            const currentUserId = request.user?.id;
            if (!currentUserId) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            return reply.send({
                success: true,
                count: 0,
            });
        }
        catch (error) {
            console.error("Error fetching unread count:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to fetch unread count",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
};
exports.default = messageRoutes;
