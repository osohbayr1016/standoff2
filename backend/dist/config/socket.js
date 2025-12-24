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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const StreamChat_1 = __importDefault(require("../models/StreamChat"));
const StreamViewer_1 = __importDefault(require("../models/StreamViewer"));
const MatchChat_1 = __importDefault(require("../models/MatchChat"));
const streamService_1 = require("../services/streamService");
const queueService_1 = require("../services/queueService");
const lobbyService_1 = require("../services/lobbyService");
class SocketManager {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: true,
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
            pingTimeout: 60000,
            pingInterval: 25000,
            maxHttpBufferSize: 5e5,
            allowEIO3: true,
            connectTimeout: 45000,
            perMessageDeflate: false,
        });
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    socket.data.userId = null;
                    socket.data.userEmail = null;
                    return next();
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                socket.data.userId = decoded.id;
                socket.data.userEmail = decoded.email;
                const user = await User_1.default.findById(decoded.id).select("name");
                if (user) {
                    socket.data.userName = user.name;
                }
                next();
            }
            catch (error) {
                socket.data.userId = null;
                socket.data.userEmail = null;
                next();
            }
        });
        this.io.on("connection", async (socket) => {
            if (socket.data.userId) {
                this.connectedUsers.set(socket.data.userId, socket.id);
                await User_1.default.findByIdAndUpdate(socket.data.userId, {
                    isOnline: true,
                    lastSeen: new Date(),
                });
                this.broadcastUserStatus(socket.data.userId, "online");
            }
            if (socket.data.userId) {
                try {
                    const pendingNotifications = await Notification_1.default.find({
                        userId: socket.data.userId,
                        status: "PENDING",
                    })
                        .populate("senderId", "name avatar")
                        .sort({ createdAt: -1 })
                        .limit(10)
                        .lean();
                    if (pendingNotifications.length > 0) {
                        const formattedNotifications = pendingNotifications.map((notif) => ({
                            _id: notif._id.toString(),
                            title: notif.title,
                            content: notif.content,
                            type: notif.type,
                            senderId: notif.senderId
                                ? {
                                    _id: notif.senderId._id.toString(),
                                    name: notif.senderId.name || "Unknown",
                                    avatar: notif.senderId.avatar,
                                }
                                : undefined,
                            createdAt: notif.createdAt,
                        }));
                        socket.emit("pending_notifications", {
                            notifications: formattedNotifications,
                            count: formattedNotifications.length,
                        });
                    }
                }
                catch (error) {
                    console.error("Error fetching pending notifications:", error);
                }
            }
            socket.on("send_message", async (data) => {
                try {
                    const { receiverId, content, replyToId } = data;
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
                        ...(replyToId && { replyToId }),
                    });
                    await newMessage.save();
                    if (replyToId) {
                        await newMessage.populate({
                            path: "replyToId",
                            select: "content senderId",
                            populate: {
                                path: "senderId",
                                select: "name",
                            },
                        });
                    }
                    const notification = new Notification_1.default({
                        userId: receiverId,
                        senderId: senderId,
                        title: `New message from ${sender.name}`,
                        content: content.trim().substring(0, 100),
                        type: "MESSAGE",
                        status: "PENDING",
                        relatedMessageId: newMessage._id,
                    });
                    await notification.save();
                    const messageData = {
                        id: newMessage._id.toString(),
                        senderId,
                        receiverId,
                        content: newMessage.content,
                        status: newMessage.status,
                        isRead: newMessage.isRead,
                        timestamp: newMessage.createdAt.toISOString(),
                        senderName: sender.name,
                        senderAvatar: sender.avatar,
                        replyToId: newMessage.replyToId?._id?.toString(),
                        replyTo: newMessage.replyToId
                            ? {
                                id: newMessage.replyToId._id.toString(),
                                content: newMessage.replyToId.content,
                                sender: {
                                    name: newMessage.replyToId.senderId?.name || "Unknown",
                                },
                            }
                            : undefined,
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
                        this.io.to(receiverSocketId).emit("new_notification", {
                            _id: notification._id.toString(),
                            title: notification.title,
                            content: notification.content,
                            type: notification.type,
                            senderId: {
                                _id: senderId,
                                name: sender.name,
                                avatar: sender.avatar,
                            },
                            relatedMessageId: newMessage._id.toString(),
                            createdAt: notification.createdAt,
                        });
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
            socket.on("stream_chat_message", async (data) => {
                try {
                    const { streamId, message, replyToId } = data;
                    const senderId = socket.data.userId;
                    if (!senderId) {
                        socket.emit("stream_chat_error", {
                            error: "Authentication required",
                        });
                        return;
                    }
                    if (!streamId || !message || !message.trim()) {
                        socket.emit("stream_chat_error", {
                            error: "Stream ID and message are required",
                        });
                        return;
                    }
                    const chatMessage = await streamService_1.StreamService.sendChatMessage(streamId, senderId, message.trim(), replyToId);
                    const populatedMessage = await StreamChat_1.default.findById(chatMessage._id)
                        .populate("userId", "name avatar")
                        .populate("replyToId", "message userId");
                    this.io.to(`stream_${streamId}`).emit("stream_chat_message", {
                        streamId,
                        message: populatedMessage,
                    });
                    socket.emit("stream_chat_sent", {
                        messageId: chatMessage._id,
                        streamId,
                    });
                }
                catch (error) {
                    console.error("Error sending stream chat message:", error);
                    socket.emit("stream_chat_error", {
                        error: error.message || "Failed to send message",
                    });
                }
            });
            socket.on("join_stream", async (data) => {
                try {
                    const { streamId } = data;
                    const userId = socket.data.userId;
                    if (!streamId) {
                        socket.emit("stream_error", {
                            error: "Stream ID is required",
                        });
                        return;
                    }
                    const sessionId = `socket_${socket.id}`;
                    const viewer = await streamService_1.StreamService.addViewer(streamId, userId, sessionId);
                    socket.join(`stream_${streamId}`);
                    socket.emit("stream_joined", {
                        streamId,
                        viewerId: viewer._id,
                    });
                    this.io.to(`stream_${streamId}`).emit("stream_viewer_count", {
                        streamId,
                        viewerCount: await StreamViewer_1.default.countDocuments({
                            streamSessionId: streamId,
                            isActive: true,
                        }),
                    });
                }
                catch (error) {
                    console.error("Error joining stream:", error);
                    socket.emit("stream_error", {
                        error: error.message || "Failed to join stream",
                    });
                }
            });
            socket.on("leave_stream", async (data) => {
                try {
                    const { streamId } = data;
                    const userId = socket.data.userId;
                    if (!streamId) {
                        return;
                    }
                    const sessionId = `socket_${socket.id}`;
                    await streamService_1.StreamService.removeViewer(streamId, userId, sessionId);
                    socket.leave(`stream_${streamId}`);
                    this.io.to(`stream_${streamId}`).emit("stream_viewer_count", {
                        streamId,
                        viewerCount: await StreamViewer_1.default.countDocuments({
                            streamSessionId: streamId,
                            isActive: true,
                        }),
                    });
                }
                catch (error) {
                    console.error("Error leaving stream:", error);
                }
            });
            socket.on("stream_reaction", async (data) => {
                try {
                    const { streamId, emoji } = data;
                    const userId = socket.data.userId;
                    if (!userId) {
                        socket.emit("stream_error", {
                            error: "Authentication required",
                        });
                        return;
                    }
                    if (!streamId || !emoji) {
                        socket.emit("stream_error", {
                            error: "Stream ID and emoji are required",
                        });
                        return;
                    }
                    this.io.to(`stream_${streamId}`).emit("stream_reaction", {
                        streamId,
                        emoji,
                        userId,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    console.error("Error handling stream reaction:", error);
                    socket.emit("stream_error", {
                        error: "Failed to send reaction",
                    });
                }
            });
            socket.on("update_status", (data) => {
                const { status } = data;
                this.broadcastUserStatus(socket.data.userId, status);
            });
            socket.on("friend_request_sent", async (data) => {
                try {
                    const { receiverId, senderData } = data;
                    const receiverSocketId = this.connectedUsers.get(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("friend_request_received", {
                            sender: senderData,
                            timestamp: new Date().toISOString(),
                        });
                    }
                }
                catch (error) {
                    console.error("Error handling friend request sent:", error);
                }
            });
            socket.on("friend_request_accepted", async (data) => {
                try {
                    const { senderId, acceptorData } = data;
                    const senderSocketId = this.connectedUsers.get(senderId);
                    if (senderSocketId) {
                        this.io.to(senderSocketId).emit("friend_request_accepted_notification", {
                            acceptor: acceptorData,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    socket.emit("friends_list_updated");
                    if (senderSocketId) {
                        this.io.to(senderSocketId).emit("friends_list_updated");
                    }
                }
                catch (error) {
                    console.error("Error handling friend request accepted:", error);
                }
            });
            socket.on("send_lobby_invite", async (data) => {
                try {
                    const { friendId, lobbyData } = data;
                    const senderId = socket.data.userId;
                    if (!senderId) {
                        socket.emit("lobby_invite_error", {
                            error: "Authentication required",
                        });
                        return;
                    }
                    const friendSocketId = this.connectedUsers.get(friendId);
                    if (friendSocketId) {
                        const sender = await User_1.default.findById(senderId).select("name avatar");
                        this.io.to(friendSocketId).emit("lobby_invite_received", {
                            inviteId: `invite_${Date.now()}`,
                            sender: {
                                id: senderId,
                                name: sender?.name,
                                avatar: sender?.avatar,
                            },
                            lobbyData,
                            timestamp: new Date().toISOString(),
                        });
                        socket.emit("lobby_invite_sent", {
                            friendId,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    else {
                        socket.emit("lobby_invite_error", {
                            error: "Friend is offline",
                        });
                    }
                }
                catch (error) {
                    console.error("Error sending lobby invite:", error);
                    socket.emit("lobby_invite_error", {
                        error: "Failed to send invite",
                    });
                }
            });
            socket.on("lobby_invite_response", async (data) => {
                try {
                    const { inviteId, senderId, accepted } = data;
                    const responderId = socket.data.userId;
                    if (!responderId) {
                        return;
                    }
                    const senderSocketId = this.connectedUsers.get(senderId);
                    if (senderSocketId) {
                        const responder = await User_1.default.findById(responderId).select("name avatar");
                        this.io.to(senderSocketId).emit("lobby_invite_responded", {
                            inviteId,
                            accepted,
                            responder: {
                                id: responderId,
                                name: responder?.name,
                                avatar: responder?.avatar,
                            },
                            timestamp: new Date().toISOString(),
                        });
                    }
                }
                catch (error) {
                    console.error("Error handling lobby invite response:", error);
                }
            });
            socket.on("join_matchmaking_room", async () => {
                try {
                    socket.join("matchmaking_queue");
                    console.log(`👀 User ${socket.data.userId} joined matchmaking room for updates`);
                    const totalInQueue = await queueService_1.QueueService.getTotalInQueue();
                    socket.emit("queue_update", {
                        totalPlayers: totalInQueue,
                    });
                }
                catch (error) {
                    console.error("Join matchmaking room error:", error);
                }
            });
            socket.on("join_queue", async (data) => {
                try {
                    const userId = socket.data.userId;
                    if (!userId) {
                        socket.emit("queue_error", {
                            error: "Authentication required",
                        });
                        return;
                    }
                    const partyMembers = data?.partyMembers || [];
                    const result = await queueService_1.QueueService.addToQueue(userId, partyMembers);
                    socket.join("matchmaking_queue");
                    socket.emit("queue_joined", {
                        success: true,
                        position: result.position,
                    });
                    const totalInQueue = await queueService_1.QueueService.getTotalInQueue();
                    this.io.to("matchmaking_queue").emit("queue_update", {
                        totalPlayers: totalInQueue,
                    });
                }
                catch (error) {
                    console.error("Join queue error:", error);
                    socket.emit("queue_error", {
                        error: error.message || "Failed to join queue",
                    });
                }
            });
            socket.on("leave_queue", async () => {
                try {
                    const userId = socket.data.userId;
                    if (!userId)
                        return;
                    await queueService_1.QueueService.removeFromQueue(userId);
                    socket.leave("matchmaking_queue");
                    socket.emit("queue_left", {
                        success: true,
                    });
                    const totalInQueue = await queueService_1.QueueService.getTotalInQueue();
                    this.io.to("matchmaking_queue").emit("queue_update", {
                        totalPlayers: totalInQueue,
                    });
                }
                catch (error) {
                    console.error("Leave queue error:", error);
                    socket.emit("queue_error", {
                        error: error.message || "Failed to leave queue",
                    });
                }
            });
            socket.on("get_queue_status", async () => {
                try {
                    const userId = socket.data.userId;
                    if (!userId) {
                        socket.emit("queue_status", {
                            inQueue: false,
                            totalPlayers: await queueService_1.QueueService.getTotalInQueue(),
                        });
                        return;
                    }
                    const position = await queueService_1.QueueService.getQueuePosition(userId);
                    const totalInQueue = await queueService_1.QueueService.getTotalInQueue();
                    socket.emit("queue_status", {
                        inQueue: position > 0,
                        position,
                        totalPlayers: totalInQueue,
                    });
                }
                catch (error) {
                    console.error("Get queue status error:", error);
                }
            });
            socket.on("send_lobby_chat", async (data) => {
                try {
                    const { lobbyId, message } = data;
                    const userId = socket.data.userId;
                    const userName = socket.data.userName || "Unknown";
                    if (!userId || !lobbyId || !message || !message.trim()) {
                        return;
                    }
                    const chatMessage = await MatchChat_1.default.create({
                        lobbyId: new mongoose_1.default.Types.ObjectId(lobbyId),
                        senderId: new mongoose_1.default.Types.ObjectId(userId),
                        message: message.trim(),
                    });
                    const chatData = {
                        id: chatMessage._id.toString(),
                        lobbyId,
                        senderId: userId,
                        senderName: userName,
                        message: message.trim(),
                        timestamp: chatMessage.createdAt.toISOString(),
                    };
                    const targetRoom = `lobby_${lobbyId.toString()}`;
                    this.io.to(targetRoom).emit("new_lobby_chat", chatData);
                    console.log(`💬 Lobby Chat [${targetRoom}]: ${userName}: ${message.trim()}`);
                }
                catch (error) {
                    console.error("Lobby chat error:", error);
                }
            });
            socket.on("join_lobby", async (data) => {
                try {
                    const { lobbyId } = data;
                    if (!lobbyId)
                        return;
                    const roomName = `lobby_${lobbyId.toString()}`;
                    socket.join(roomName);
                    console.log(`👤 User ${socket.data.userId} joined room: ${roomName}`);
                    const lobby = await lobbyService_1.LobbyService.getLobby(lobbyId);
                    if (lobby) {
                        socket.emit("lobby_state", { lobby });
                        const chatHistory = await MatchChat_1.default.find({ lobbyId: new mongoose_1.default.Types.ObjectId(lobbyId) })
                            .sort({ createdAt: -1 })
                            .limit(50)
                            .populate("senderId", "name avatar");
                        socket.emit("lobby_chat_history", chatHistory.reverse().map(msg => ({
                            id: msg._id,
                            lobbyId: msg.lobbyId,
                            senderId: msg.senderId._id,
                            senderName: msg.senderId.name,
                            senderAvatar: msg.senderId.avatar,
                            message: msg.message,
                            timestamp: msg.createdAt,
                        })));
                    }
                }
                catch (error) {
                    console.error("Join lobby error:", error);
                    socket.emit("lobby_error", {
                        error: error.message || "Failed to join lobby",
                    });
                }
            });
            socket.on("refresh_lobby", async (data) => {
                const { lobbyId } = data;
                if (!lobbyId)
                    return;
                const lobby = await lobbyService_1.LobbyService.getLobby(lobbyId);
                if (lobby) {
                    this.io.to(`lobby_${lobbyId}`).emit("lobby_update", { lobby });
                }
            });
            socket.on("player_kicked_notify", (data) => {
                const { lobbyId, targetUserId } = data;
                this.io.to(`lobby_${lobbyId}`).emit("player_kicked", { targetUserId });
            });
            socket.on("player_ready", async (data) => {
                try {
                    const { lobbyId } = data;
                    const userId = socket.data.userId;
                    if (!userId || !lobbyId) {
                        socket.emit("lobby_error", {
                            error: "Invalid request",
                        });
                        return;
                    }
                    const result = await lobbyService_1.LobbyService.markPlayerReady(lobbyId, userId);
                    this.io.to(`lobby_${lobbyId}`).emit("lobby_update", {
                        lobby: {
                            ...result.lobby.toObject(),
                            players: result.lobby.players.map((p) => ({
                                userId: p.userId.toString(),
                                inGameName: p.inGameName,
                                standoff2Id: p.standoff2Id,
                                elo: p.elo,
                                isReady: p.isReady,
                            })),
                        },
                        allReady: result.allReady,
                    });
                    if (result.allReady) {
                        this.io.to(`lobby_${lobbyId}`).emit("all_players_ready", {
                            lobby: {
                                ...result.lobby.toObject(),
                                players: result.lobby.players.map((p) => ({
                                    userId: p.userId.toString(),
                                    inGameName: p.inGameName,
                                    standoff2Id: p.standoff2Id,
                                    elo: p.elo,
                                    isReady: p.isReady,
                                })),
                            },
                        });
                    }
                }
                catch (error) {
                    console.error("Player ready error:", error);
                    socket.emit("lobby_error", {
                        error: error.message || "Failed to mark ready",
                    });
                }
            });
            socket.on("ban_map", async (data) => {
                try {
                    const { lobbyId, mapName } = data;
                    const userId = socket.data.userId;
                    if (!userId || !lobbyId || !mapName) {
                        socket.emit("map_ban_error", {
                            error: "Invalid request",
                        });
                        return;
                    }
                    const { MapBanService } = await Promise.resolve().then(() => __importStar(require("../services/mapBanService")));
                    const lobby = await MapBanService.banMap(lobbyId, userId, mapName);
                    const banStatus = await MapBanService.getMapBanStatus(lobbyId);
                    this.io.to(`lobby_${lobbyId}`).emit("map_ban_update", {
                        availableMaps: banStatus.availableMaps,
                        bannedMaps: banStatus.bannedMaps,
                        selectedMap: banStatus.selectedMap,
                        currentBanTeam: banStatus.currentBanTeam,
                        mapBanPhase: banStatus.mapBanPhase,
                        banHistory: banStatus.banHistory,
                        teamAlphaLeader: banStatus.teamAlphaLeader,
                        teamBravoLeader: banStatus.teamBravoLeader,
                    });
                    if (!banStatus.mapBanPhase && banStatus.selectedMap) {
                        this.io.to(`lobby_${lobbyId}`).emit("map_ban_complete", {
                            selectedMap: banStatus.selectedMap,
                            lobby: await queueService_1.QueueService.getLobby(lobbyId),
                        });
                    }
                    else {
                        const { MapBanService } = await Promise.resolve().then(() => __importStar(require("../services/mapBanService")));
                        setTimeout(async () => {
                            const botBannedLobby = await MapBanService.autoBanForBots(lobbyId);
                            if (botBannedLobby) {
                                const updatedBanStatus = await MapBanService.getMapBanStatus(lobbyId);
                                this.io.to(`lobby_${lobbyId}`).emit("map_ban_update", {
                                    availableMaps: updatedBanStatus.availableMaps,
                                    bannedMaps: updatedBanStatus.bannedMaps,
                                    selectedMap: updatedBanStatus.selectedMap,
                                    currentBanTeam: updatedBanStatus.currentBanTeam,
                                    mapBanPhase: updatedBanStatus.mapBanPhase,
                                    banHistory: updatedBanStatus.banHistory,
                                    teamAlphaLeader: updatedBanStatus.teamAlphaLeader,
                                    teamBravoLeader: updatedBanStatus.teamBravoLeader,
                                });
                                if (!updatedBanStatus.mapBanPhase && updatedBanStatus.selectedMap) {
                                    this.io.to(`lobby_${lobbyId}`).emit("map_ban_complete", {
                                        selectedMap: updatedBanStatus.selectedMap,
                                        lobby: await queueService_1.QueueService.getLobby(lobbyId),
                                    });
                                }
                            }
                        }, 1000);
                    }
                }
                catch (error) {
                    console.error("Ban map error:", error);
                    socket.emit("map_ban_error", {
                        error: error.message || "Failed to ban map",
                    });
                }
            });
            socket.on("leave_lobby", async (data) => {
                try {
                    const { lobbyId } = data;
                    const userId = socket.data.userId;
                    if (!userId || !lobbyId)
                        return;
                    const cancelled = await queueService_1.QueueService.cancelLobby(lobbyId);
                    if (cancelled) {
                        this.io.to(`lobby_${lobbyId}`).emit("lobby_cancelled", {
                            reason: "A player left the lobby",
                        });
                        const socketsInRoom = await this.io.in(`lobby_${lobbyId}`).fetchSockets();
                        socketsInRoom.forEach((s) => {
                            s.leave(`lobby_${lobbyId}`);
                        });
                    }
                    socket.emit("lobby_left", {
                        success: true,
                    });
                }
                catch (error) {
                    console.error("Leave lobby error:", error);
                    socket.emit("lobby_error", {
                        error: error.message || "Failed to leave lobby",
                    });
                }
            });
            socket.on("disconnect", async () => {
                const userId = socket.data.userId;
                if (userId) {
                    this.connectedUsers.delete(userId);
                    await queueService_1.QueueService.removeFromQueue(userId);
                    await User_1.default.findByIdAndUpdate(userId, {
                        isOnline: false,
                        lastSeen: new Date(),
                    });
                    this.broadcastUserStatus(userId, "offline");
                }
            });
        });
    }
    async broadcastUserStatus(userId, status) {
        if (this.io) {
            this.io.emit("user_status_changed", {
                userId,
                status,
                timestamp: new Date().toISOString(),
            });
            try {
                const PlayerProfile = (await Promise.resolve().then(() => __importStar(require("../models/PlayerProfile")))).default;
                const profile = await PlayerProfile.findOne({ userId });
                if (profile && profile.friends && profile.friends.length > 0) {
                    profile.friends.forEach((friendId) => {
                        const friendSocketId = this.connectedUsers.get(friendId.toString());
                        if (friendSocketId) {
                            this.io.to(friendSocketId).emit("friend_status_changed", {
                                friendId: userId,
                                status,
                                timestamp: new Date().toISOString(),
                            });
                        }
                    });
                }
            }
            catch (error) {
                console.error("Error notifying friends of status change:", error);
            }
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
    broadcastStreamEvent(streamId, event, data) {
        if (this.io) {
            this.io.to(`stream_${streamId}`).emit(event, data);
        }
    }
    broadcastStreamStarted(streamSession) {
        if (this.io) {
            this.io.emit("stream_started", {
                streamId: streamSession._id,
                title: streamSession.title,
                organizer: streamSession.organizerId,
                platforms: streamSession.platforms,
                timestamp: new Date().toISOString(),
            });
        }
    }
    broadcastStreamEnded(streamSession) {
        if (this.io) {
            this.io.emit("stream_ended", {
                streamId: streamSession._id,
                title: streamSession.title,
                duration: streamSession.duration,
                timestamp: new Date().toISOString(),
            });
        }
    }
    updateStreamViewerCount(streamId, count) {
        if (this.io) {
            this.io.to(`stream_${streamId}`).emit("stream_viewer_count", {
                streamId,
                viewerCount: count,
                timestamp: new Date().toISOString(),
            });
        }
    }
    notifyLobbyFound(userIds, lobbyData) {
        if (this.io) {
            console.log(`📢 Attempting to notify ${userIds.length} players of lobby`);
            console.log(`🔌 Currently connected users: ${this.connectedUsers.size}`);
            let notifiedCount = 0;
            userIds.forEach((userId) => {
                const socketId = this.connectedUsers.get(userId);
                if (socketId) {
                    console.log(`✅ Notifying player ${userId} via socket ${socketId}`);
                    this.io.to(socketId).emit("lobby_found", lobbyData);
                    notifiedCount++;
                }
                else {
                    console.log(`❌ Player ${userId} not found in connected users`);
                    console.log(`   Connected user IDs: ${Array.from(this.connectedUsers.keys()).join(', ')}`);
                }
            });
            console.log(`📊 Notified ${notifiedCount}/${userIds.length} players`);
        }
    }
    broadcastQueueUpdate(totalPlayers) {
        if (this.io) {
            this.io.to("matchmaking_queue").emit("queue_update", {
                totalPlayers,
            });
        }
    }
    async broadcastMapBanStarted(lobbyId) {
        if (this.io) {
            try {
                const { MapBanService } = await Promise.resolve().then(() => __importStar(require("../services/mapBanService")));
                const status = await MapBanService.getMapBanStatus(lobbyId);
                this.io.to(`lobby_${lobbyId}`).emit("map_ban_started", {
                    availableMaps: status.availableMaps,
                    currentBanTeam: status.currentBanTeam,
                    teamAlphaLeader: status.teamAlphaLeader,
                    teamBravoLeader: status.teamBravoLeader,
                });
            }
            catch (error) {
                console.error("Error broadcasting map ban started:", error);
            }
        }
    }
    getIO() {
        return this.io;
    }
}
exports.SocketManager = SocketManager;
exports.default = SocketManager;
