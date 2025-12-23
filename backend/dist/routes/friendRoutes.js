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
const auth_1 = require("../middleware/auth");
const FriendRequest_1 = __importStar(require("../models/FriendRequest"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
const friendRoutes = async (fastify) => {
    fastify.post("/search", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const { query } = req.body;
            if (!query || query.trim().length === 0) {
                return reply.status(400).send({ message: "Search query is required" });
            }
            const searchQuery = query.trim();
            const userId = req.user.id;
            console.log(`Friend search: "${searchQuery}" by user ${userId}`);
            const searchConditions = [
                { inGameName: { $regex: searchQuery, $options: "i" } },
            ];
            if (searchQuery.includes("-")) {
                searchConditions.unshift({ uniqueId: searchQuery });
            }
            else {
                searchConditions.push({ uniqueId: { $regex: searchQuery, $options: "i" } });
            }
            searchConditions.push({ standoff2Id: { $regex: searchQuery, $options: "i" } });
            const profiles = await PlayerProfile_1.default.find({
                $or: searchConditions,
                userId: { $ne: userId },
            })
                .populate("userId", "name email avatar isOnline")
                .limit(10)
                .lean();
            console.log(`Found ${profiles.length} profiles`);
            const results = profiles
                .filter((profile) => profile.userId)
                .map((profile) => ({
                id: profile._id.toString(),
                userId: profile.userId._id.toString(),
                inGameName: profile.inGameName,
                uniqueId: profile.uniqueId,
                standoff2Id: profile.standoff2Id,
                avatar: profile.avatar || profile.userId.avatar || "/default-avatar.png",
                elo: profile.elo || 1000,
                isOnline: profile.isOnline || false,
            }));
            console.log(`Returning ${results.length} results after filtering`);
            reply.send({ results });
        }
        catch (error) {
            console.error("Friend search error:", error);
            reply.status(500).send({
                message: "Failed to search for users",
                error: process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
            });
        }
    });
    fastify.post("/request", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const { receiverId } = req.body;
            const userId = req.user.id;
            const userName = req.user.name;
            console.log(`[Friend Request] Received request from ${userId} to ${receiverId}`);
            if (!receiverId) {
                console.log("[Friend Request] ERROR: No receiverId provided");
                return reply.status(400).send({
                    success: false,
                    message: "Receiver ID is required"
                });
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(receiverId)) {
                console.log(`[Friend Request] ERROR: Invalid receiverId format: ${receiverId}`);
                return reply.status(400).send({
                    success: false,
                    message: "Invalid receiver ID format"
                });
            }
            if (receiverId === userId) {
                console.log("[Friend Request] ERROR: Cannot send request to yourself");
                return reply
                    .status(400)
                    .send({
                    success: false,
                    message: "Cannot send friend request to yourself"
                });
            }
            const receiver = await User_1.default.findById(receiverId);
            if (!receiver) {
                console.log(`[Friend Request] ERROR: User not found: ${receiverId}`);
                return reply.status(404).send({
                    success: false,
                    message: "User not found"
                });
            }
            const senderProfile = await PlayerProfile_1.default.findOne({ userId });
            if (senderProfile?.friends.some((f) => f.toString() === receiverId.toString())) {
                console.log("[Friend Request] ERROR: Already friends");
                return reply.status(400).send({
                    success: false,
                    message: "Already friends"
                });
            }
            const existingRequest = await FriendRequest_1.default.findOne({
                $or: [
                    { senderId: userId, receiverId },
                    { senderId: receiverId, receiverId: userId },
                ],
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            });
            if (existingRequest) {
                console.log("[Friend Request] ERROR: Request already pending");
                return reply
                    .status(400)
                    .send({
                    success: false,
                    message: "Friend request already pending"
                });
            }
            const friendRequest = await FriendRequest_1.default.create({
                senderId: userId,
                receiverId,
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            });
            await Notification_1.default.create({
                userId: receiverId,
                title: "Friend Request",
                content: `${userName} sent you a friend request`,
                type: "FRIEND_REQUEST",
                senderId: userId,
            });
            console.log(`[Friend Request] SUCCESS: Request created with ID ${friendRequest._id}`);
            reply.status(201).send({
                success: true,
                message: "Friend request sent successfully",
                request: friendRequest,
            });
        }
        catch (error) {
            console.error("[Friend Request] EXCEPTION:", error);
            reply.status(500).send({
                success: false,
                message: "Failed to send friend request",
                error: process.env.NODE_ENV === "development" ? error.message : undefined
            });
        }
    });
    fastify.get("/requests/incoming", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const userId = req.user.id;
            const requests = await FriendRequest_1.default.find({
                receiverId: userId,
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            })
                .populate("senderId", "name email avatar")
                .sort({ createdAt: -1 });
            const requestsWithProfiles = await Promise.all(requests.map(async (request) => {
                const profile = await PlayerProfile_1.default.findOne({
                    userId: request.senderId,
                });
                return {
                    id: request._id,
                    sender: {
                        id: request.senderId._id,
                        name: request.senderId.name,
                        avatar: profile?.avatar || request.senderId.avatar,
                        standoff2Id: profile?.standoff2Id,
                        elo: profile?.elo,
                    },
                    createdAt: request.createdAt,
                };
            }));
            reply.send({ requests: requestsWithProfiles });
        }
        catch (error) {
            console.error("Get incoming requests error:", error);
            reply.status(500).send({ message: "Failed to fetch friend requests" });
        }
    });
    fastify.post("/accept/:requestId", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            const userName = req.user.name;
            const friendRequest = await FriendRequest_1.default.findOne({
                _id: requestId,
                receiverId: userId,
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            }).session(session);
            if (!friendRequest) {
                await session.abortTransaction();
                return reply.status(404).send({ message: "Friend request not found" });
            }
            friendRequest.status = FriendRequest_1.FriendRequestStatus.ACCEPTED;
            await friendRequest.save({ session });
            await PlayerProfile_1.default.findOneAndUpdate({ userId }, { $addToSet: { friends: friendRequest.senderId } }, { session });
            await PlayerProfile_1.default.findOneAndUpdate({ userId: friendRequest.senderId }, { $addToSet: { friends: userId } }, { session });
            await Notification_1.default.create([
                {
                    userId: friendRequest.senderId,
                    title: "Friend Request Accepted",
                    content: `${userName} accepted your friend request`,
                    type: "SYSTEM",
                    senderId: userId,
                },
            ], { session });
            await session.commitTransaction();
            reply.send({ message: "Friend request accepted" });
        }
        catch (error) {
            await session.abortTransaction();
            console.error("Accept friend request error:", error);
            reply.status(500).send({ message: "Failed to accept friend request" });
        }
        finally {
            session.endSession();
        }
    });
    fastify.get("/requests/outgoing", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const userId = req.user.id;
            const requests = await FriendRequest_1.default.find({
                senderId: userId,
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            })
                .populate("receiverId", "name email avatar")
                .sort({ createdAt: -1 });
            const requestsWithProfiles = await Promise.all(requests.map(async (request) => {
                const profile = await PlayerProfile_1.default.findOne({
                    userId: request.receiverId,
                });
                return {
                    id: request._id,
                    receiver: {
                        id: request.receiverId._id,
                        name: request.receiverId.name,
                        avatar: profile?.avatar || request.receiverId.avatar,
                        standoff2Id: profile?.standoff2Id,
                        elo: profile?.elo,
                    },
                    createdAt: request.createdAt,
                };
            }));
            reply.send({ requests: requestsWithProfiles });
        }
        catch (error) {
            console.error("Get outgoing requests error:", error);
            reply.status(500).send({ message: "Failed to fetch outgoing friend requests" });
        }
    });
    fastify.post("/cancel/:requestId", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            const friendRequest = await FriendRequest_1.default.findOne({
                _id: requestId,
                senderId: userId,
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            });
            if (!friendRequest) {
                return reply.status(404).send({
                    success: false,
                    message: "Friend request not found"
                });
            }
            friendRequest.status = FriendRequest_1.FriendRequestStatus.REJECTED;
            await friendRequest.save();
            reply.send({
                success: true,
                message: "Friend request cancelled"
            });
        }
        catch (error) {
            console.error("Cancel friend request error:", error);
            reply.status(500).send({
                success: false,
                message: "Failed to cancel friend request"
            });
        }
    });
    fastify.post("/reject/:requestId", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            const friendRequest = await FriendRequest_1.default.findOne({
                _id: requestId,
                receiverId: userId,
                status: FriendRequest_1.FriendRequestStatus.PENDING,
            });
            if (!friendRequest) {
                return reply.status(404).send({ message: "Friend request not found" });
            }
            friendRequest.status = FriendRequest_1.FriendRequestStatus.REJECTED;
            await friendRequest.save();
            reply.send({ message: "Friend request rejected" });
        }
        catch (error) {
            console.error("Reject friend request error:", error);
            reply.status(500).send({ message: "Failed to reject friend request" });
        }
    });
    fastify.get("/", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        try {
            const userId = req.user.id;
            const profile = await PlayerProfile_1.default.findOne({ userId });
            if (!profile || !profile.friends || profile.friends.length === 0) {
                return reply.send({ friends: [] });
            }
            const friendProfiles = await PlayerProfile_1.default.find({
                userId: { $in: profile.friends },
            }).populate("userId", "name email avatar isOnline lastSeen");
            const friends = friendProfiles.map((fp) => ({
                id: fp._id,
                userId: fp.userId._id,
                name: fp.userId.name,
                inGameName: fp.inGameName,
                standoff2Id: fp.standoff2Id,
                avatar: fp.avatar || fp.userId.avatar,
                elo: fp.elo,
                isOnline: fp.isOnline,
                lastSeen: fp.userId.lastSeen,
                wins: fp.wins,
                losses: fp.losses,
            }));
            reply.send({ friends });
        }
        catch (error) {
            console.error("Get friends error:", error);
            reply.status(500).send({ message: "Failed to fetch friends" });
        }
    });
    fastify.delete("/:friendId", { preHandler: auth_1.authenticateToken }, async (req, reply) => {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const { friendId } = req.params;
            const userId = req.user.id;
            await PlayerProfile_1.default.findOneAndUpdate({ userId }, { $pull: { friends: friendId } }, { session });
            await PlayerProfile_1.default.findOneAndUpdate({ userId: friendId }, { $pull: { friends: userId } }, { session });
            await session.commitTransaction();
            reply.send({ message: "Friend removed successfully" });
        }
        catch (error) {
            await session.abortTransaction();
            console.error("Remove friend error:", error);
            reply.status(500).send({ message: "Failed to remove friend" });
        }
        finally {
            session.endSession();
        }
    });
};
exports.default = friendRoutes;
