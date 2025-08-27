"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const notificationRoutes = async (fastify) => {
    fastify.get("/notifications/health", async (request, reply) => {
        return {
            success: true,
            message: "Notification routes available",
            timestamp: new Date().toISOString(),
        };
    });
    fastify.get("/notifications", {
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
                notifications: [],
                count: 0,
                unreadCount: 0,
            });
        }
        catch (error) {
            console.error("Error fetching notifications:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to fetch notifications",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.get("/notifications/unread/count", {
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
            console.error("Error fetching unread notification count:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to fetch unread notification count",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.post("/notifications/:notificationId/read", {
        preHandler: auth_1.authenticateToken,
    }, async (request, reply) => {
        try {
            const { notificationId } = request.params;
            const currentUserId = request.user?.id;
            if (!currentUserId) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            if (!notificationId) {
                return reply.status(400).send({
                    success: false,
                    message: "Notification ID is required",
                });
            }
            return reply.send({
                success: true,
                message: "Notification marked as read",
            });
        }
        catch (error) {
            console.error("Error marking notification as read:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to mark notification as read",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.post("/notifications/read-all", {
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
                message: "All notifications marked as read",
            });
        }
        catch (error) {
            console.error("Error marking all notifications as read:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to mark all notifications as read",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
    fastify.delete("/notifications/:notificationId", {
        preHandler: auth_1.authenticateToken,
    }, async (request, reply) => {
        try {
            const { notificationId } = request.params;
            const currentUserId = request.user?.id;
            if (!currentUserId) {
                return reply.status(401).send({
                    success: false,
                    message: "Authentication required",
                });
            }
            if (!notificationId) {
                return reply.status(400).send({
                    success: false,
                    message: "Notification ID is required",
                });
            }
            return reply.send({
                success: true,
                message: "Notification deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting notification:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to delete notification",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
};
exports.default = notificationRoutes;
