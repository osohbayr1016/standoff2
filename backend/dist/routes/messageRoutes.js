"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
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
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid user ID",
                });
            }
            const messages = await Message_1.default.find({
                $or: [
                    { senderId: currentUserId, receiverId: userId },
                    { senderId: userId, receiverId: currentUserId },
                ],
            })
                .sort({ createdAt: 1 })
                .populate("senderId", "name avatar")
                .populate("receiverId", "name avatar")
                .lean();
            const formattedMessages = messages.map((msg) => ({
                id: msg._id.toString(),
                content: msg.content,
                senderId: msg.senderId._id.toString(),
                receiverId: msg.receiverId._id.toString(),
                status: msg.status,
                isRead: msg.isRead,
                createdAt: msg.createdAt,
                sender: {
                    id: msg.senderId._id.toString(),
                    name: msg.senderId.name || "Unknown",
                    avatar: msg.senderId.avatar,
                },
                receiver: {
                    id: msg.receiverId._id.toString(),
                    name: msg.receiverId.name || "Unknown",
                    avatar: msg.receiverId.avatar,
                },
            }));
            await Message_1.default.updateMany({
                senderId: userId,
                receiverId: currentUserId,
                status: "SENT",
            }, { status: "DELIVERED" });
            return reply.send({
                success: true,
                messages: formattedMessages,
                count: formattedMessages.length,
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
            if (!mongoose_1.default.Types.ObjectId.isValid(receiverId)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid receiver ID",
                });
            }
            const receiver = await User_1.default.findById(receiverId).select("name avatar");
            if (!receiver) {
                return reply.status(404).send({
                    success: false,
                    message: "Receiver not found",
                });
            }
            const newMessage = new Message_1.default({
                senderId: currentUserId,
                receiverId,
                content: content.trim(),
                status: "SENT",
                isRead: false,
            });
            await newMessage.save();
            await newMessage.populate("senderId", "name avatar");
            await newMessage.populate("receiverId", "name avatar");
            const formattedMessage = {
                id: newMessage._id.toString(),
                content: newMessage.content,
                senderId: currentUserId,
                receiverId,
                status: newMessage.status,
                isRead: newMessage.isRead,
                createdAt: newMessage.createdAt,
                sender: {
                    id: currentUserId,
                    name: request.user?.name || "Unknown",
                    avatar: request.user?.avatar,
                },
                receiver: {
                    id: receiverId,
                    name: receiver.name || "Unknown",
                    avatar: receiver.avatar,
                },
            };
            return reply.status(201).send({
                success: true,
                message: "Message sent successfully",
                data: formattedMessage,
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
            if (!mongoose_1.default.Types.ObjectId.isValid(senderId)) {
                return reply.status(400).send({
                    success: false,
                    message: "Invalid sender ID",
                });
            }
            const result = await Message_1.default.updateMany({
                senderId,
                receiverId: currentUserId,
                isRead: false,
            }, {
                isRead: true,
                status: "READ",
                readAt: new Date(),
            });
            return reply.send({
                success: true,
                message: "Messages marked as read",
                count: result.modifiedCount,
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
            const count = await Message_1.default.countDocuments({
                receiverId: currentUserId,
                isRead: false,
            });
            return reply.send({
                success: true,
                count,
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
    fastify.get("/messages/conversations", {
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
            const sentMessages = await Message_1.default.find({ senderId: currentUserId })
                .distinct("receiverId")
                .lean();
            const receivedMessages = await Message_1.default.find({
                receiverId: currentUserId,
            })
                .distinct("senderId")
                .lean();
            const uniqueUserIds = [
                ...new Set([...sentMessages, ...receivedMessages]),
            ];
            const conversations = await Promise.all(uniqueUserIds.map(async (userId) => {
                const user = await User_1.default.findById(userId).select("name avatar");
                const lastMessage = await Message_1.default.findOne({
                    $or: [
                        { senderId: currentUserId, receiverId: userId },
                        { senderId: userId, receiverId: currentUserId },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .lean();
                const unreadCount = await Message_1.default.countDocuments({
                    senderId: userId,
                    receiverId: currentUserId,
                    isRead: false,
                });
                return {
                    userId: userId.toString(),
                    userName: user?.name || "Unknown",
                    userAvatar: user?.avatar,
                    lastMessage: lastMessage
                        ? {
                            content: lastMessage.content,
                            createdAt: lastMessage.createdAt,
                            isOwnMessage: lastMessage.senderId.toString() === currentUserId,
                        }
                        : null,
                    unreadCount,
                };
            }));
            conversations.sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || new Date(0);
                const bTime = b.lastMessage?.createdAt || new Date(0);
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
            return reply.send({
                success: true,
                conversations,
                count: conversations.length,
            });
        }
        catch (error) {
            console.error("Error fetching conversations:", error);
            return reply.status(500).send({
                success: false,
                message: "Failed to fetch conversations",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
};
exports.default = messageRoutes;
