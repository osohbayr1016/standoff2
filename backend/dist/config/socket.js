"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        this.io.on("connection", (socket) => {
            this.connectedUsers.set(socket.data.userId, socket.id);
            this.broadcastUserStatus(socket.data.userId, "online");
            socket.on("send_message", async (data) => {
                try {
                    const { receiverId, content } = data;
                    const receiverSocketId = this.connectedUsers.get(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("new_message", {
                            senderId: socket.data.userId,
                            content,
                            timestamp: new Date().toISOString(),
                        });
                        socket.emit("message_delivered", {
                            receiverId,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    else {
                        socket.emit("message_sent_offline", {
                            receiverId,
                            timestamp: new Date().toISOString(),
                        });
                    }
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
            socket.on("mark_read", (data) => {
                const { senderId } = data;
                const senderSocketId = this.connectedUsers.get(senderId);
                if (senderSocketId) {
                    this.io.to(senderSocketId).emit("message_read", {
                        readerId: socket.data.userId,
                        timestamp: new Date().toISOString(),
                    });
                }
            });
            socket.on("update_status", (data) => {
                const { status } = data;
                this.broadcastUserStatus(socket.data.userId, status);
            });
            socket.on("disconnect", () => {
                this.connectedUsers.delete(socket.data.userId);
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
