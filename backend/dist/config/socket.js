"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
class SocketManager {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error("Authentication error"));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.data.userId = decoded.id;
                socket.data.userEmail = decoded.email;
                next();
            }
            catch (error) {
                next(new Error("Authentication error"));
            }
        });
        this.io.on("connection", async (socket) => {
            this.connectedUsers.set(socket.data.userId, socket.id);
            await User_1.default.findByIdAndUpdate(socket.data.userId, {
                isOnline: true,
                lastSeen: new Date(),
            });
            this.broadcastUserStatus(socket.data.userId, "online");
            socket.on("send_message", async (data) => {
                try {
                    const { receiverId, content } = data;
                    const senderId = socket.data.userId;
                    if (!receiverId || !content || !content.trim()) {
                        socket.emit("message_error", {
                            error: "Invalid message data",
                        });
                        return;
                    }
                    const sender = await User_1.default.findById(senderId).select("name avatar");
                    if (!sender) {
                        socket.emit("message_error", {
                            error: "Sender not found",
                        });
                        return;
                    }
                    const receiver = await User_1.default.findById(receiverId).select("name avatar");
                    if (!receiver) {
                        socket.emit("message_error", {
                            error: "Receiver not found",
                        });
                        return;
                    }
                    const newMessage = new Message_1.default({
                        senderId,
                        receiverId,
                        content: content.trim(),
                        status: "SENT",
                        isRead: false,
                    });
                    await newMessage.save();
                    const messageData = {
                        id: newMessage._id.toString(),
                        senderId,
                        receiverId,
                        content: newMessage.content,
                        timestamp: newMessage.createdAt.toISOString(),
                        sender: {
                            id: senderId,
                            name: sender.name,
                            avatar: sender.avatar,
                        },
                        receiver: {
                            id: receiverId,
                            name: receiver.name,
                            avatar: receiver.avatar,
                        },
                    };
                    const receiverSocketId = this.connectedUsers.get(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("new_message", messageData);
                        await Message_1.default.findByIdAndUpdate(newMessage._id, {
                            status: "DELIVERED",
                        });
                        socket.emit("message_delivered", {
                            messageId: newMessage._id.toString(),
                            receiverId,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    else {
                        socket.emit("message_sent_offline", {
                            messageId: newMessage._id.toString(),
                            receiverId,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    socket.emit("message_sent", messageData);
                }
                catch (error) {
                    console.error("Error sending message:", error);
                    socket.emit("message_error", {
                        error: "Failed to send message",
                    });
                }
            });
            socket.on("typing_start", (data) => {
                const { receiverId } = data;
                const receiverSocketId = this.connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit("user_typing", {
                        userId: socket.data.userId,
                    });
                }
            });
            socket.on("typing_stop", (data) => {
                const { receiverId } = data;
                const receiverSocketId = this.connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit("user_stopped_typing", {
                        userId: socket.data.userId,
                    });
                }
            });
            socket.on("mark_read", async (data) => {
                try {
                    const { senderId } = data;
                    const receiverId = socket.data.userId;
                    await Message_1.default.updateMany({
                        senderId,
                        receiverId,
                        isRead: false,
                    }, {
                        isRead: true,
                        status: "READ",
                        readAt: new Date(),
                    });
                    const senderSocketId = this.connectedUsers.get(senderId);
                    if (senderSocketId) {
                        this.io.to(senderSocketId).emit("message_read", {
                            readerId: receiverId,
                            timestamp: new Date().toISOString(),
                        });
                    }
                }
                catch (error) {
                    console.error("Error marking messages as read:", error);
                }
            });
            socket.on("update_status", (data) => {
                const { status } = data;
                this.broadcastUserStatus(socket.data.userId, status);
            });
            socket.on("disconnect", async () => {
                this.connectedUsers.delete(socket.data.userId);
                await User_1.default.findByIdAndUpdate(socket.data.userId, {
                    isOnline: false,
                    lastSeen: new Date(),
                });
                this.broadcastUserStatus(socket.data.userId, "offline");
            });
        });
    }
    broadcastUserStatus(userId, status) {
        if (this.io) {
            this.io.emit("user_status_changed", {
                userId,
                status,
                timestamp: new Date().toISOString(),
            });
        }
    }
    broadcast(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    getOnlineUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    sendToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit(event, data);
        }
    }
}
exports.SocketManager = SocketManager;
exports.default = SocketManager;
