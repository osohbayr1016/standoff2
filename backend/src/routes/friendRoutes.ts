import { FastifyPluginAsync } from "fastify";
import { authenticateToken } from "../middleware/auth";
import FriendRequest, { FriendRequestStatus } from "../models/FriendRequest";
import PlayerProfile from "../models/PlayerProfile";
import User from "../models/User";
import Notification from "../models/Notification";
import mongoose from "mongoose";

const friendRoutes: FastifyPluginAsync = async (fastify) => {
  // Search for users by Standoff2 ID or username
  fastify.post("/search", { preHandler: authenticateToken }, async (req, reply) => {
    try {
      const { query } = req.body as { query: string };

      if (!query || query.trim().length === 0) {
        return reply.status(400).send({ message: "Search query is required" });
      }

      const searchQuery = query.trim();
      const userId = (req as any).user.id;
      console.log(`Friend search: "${searchQuery}" by user ${userId}`);

      // Search by uniqueId (exact match), standoff2Id, or inGameName
      const searchConditions: any[] = [
        { inGameName: { $regex: searchQuery, $options: "i" } },
      ];

      // If search query looks like a unique ID (contains hyphen), try exact match
      if (searchQuery.includes("-")) {
        searchConditions.unshift({ uniqueId: searchQuery });
      } else {
        // Also search uniqueId with regex if no hyphen
        searchConditions.push({ uniqueId: { $regex: searchQuery, $options: "i" } });
      }

      // Add standoff2Id search
      searchConditions.push({ standoff2Id: { $regex: searchQuery, $options: "i" } });

      const profiles = await PlayerProfile.find({
        $or: searchConditions,
        userId: { $ne: userId },
      })
        .populate("userId", "name email avatar isOnline")
        .limit(10)
        .lean();

      console.log(`Found ${profiles.length} profiles`);

      const results = profiles
        .filter((profile) => profile.userId)
        .map((profile: any) => ({
          id: profile._id.toString(),
          userId: profile.userId._id.toString(),
          inGameName: profile.inGameName,
          uniqueId: profile.uniqueId,
          standoff2Id: profile.standoff2Id,
          avatar:
            profile.avatar || profile.userId.avatar || "/default-avatar.png",
          elo: profile.elo || 1000,
          isOnline: profile.isOnline || false,
        }));

      console.log(`Returning ${results.length} results after filtering`);
      reply.send({ results });
    } catch (error) {
      console.error("Friend search error:", error);
      reply.status(500).send({
        message: "Failed to search for users",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  });

  // Send friend request
  fastify.post("/request", { preHandler: authenticateToken }, async (req, reply) => {
    try {
      const { receiverId } = req.body as { receiverId: string };
      const userId = (req as any).user.id;
      const userName = (req as any).user.name;

      console.log(`[Friend Request] Received request from ${userId} to ${receiverId}`);

      if (!receiverId) {
        console.log("[Friend Request] ERROR: No receiverId provided");
        return reply.status(400).send({ 
          success: false,
          message: "Receiver ID is required" 
        });
      }

      // Validate receiverId is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
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

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        console.log(`[Friend Request] ERROR: User not found: ${receiverId}`);
        return reply.status(404).send({ 
          success: false,
          message: "User not found" 
        });
      }

      const senderProfile = await PlayerProfile.findOne({ userId });
      if (
        senderProfile?.friends.some(
          (f) => f.toString() === receiverId.toString()
        )
      ) {
        console.log("[Friend Request] ERROR: Already friends");
        return reply.status(400).send({ 
          success: false,
          message: "Already friends" 
        });
      }

      const existingRequest = await FriendRequest.findOne({
        $or: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
        status: FriendRequestStatus.PENDING,
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

      const friendRequest = await FriendRequest.create({
        senderId: userId,
        receiverId,
        status: FriendRequestStatus.PENDING,
      });

      await Notification.create({
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
    } catch (error) {
      console.error("[Friend Request] EXCEPTION:", error);
      reply.status(500).send({ 
        success: false,
        message: "Failed to send friend request",
        error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
      });
    }
  });

  // Get incoming friend requests
  fastify.get(
    "/requests/incoming",
    { preHandler: authenticateToken },
    async (req, reply) => {
      try {
        const userId = (req as any).user.id;
        const requests = await FriendRequest.find({
          receiverId: userId,
          status: FriendRequestStatus.PENDING,
        })
          .populate("senderId", "name email avatar")
          .sort({ createdAt: -1 });

        const requestsWithProfiles = await Promise.all(
          requests.map(async (request) => {
            const profile = await PlayerProfile.findOne({
              userId: request.senderId,
            });
            return {
              id: request._id,
              sender: {
                id: (request.senderId as any)._id,
                name: (request.senderId as any).name,
                avatar:
                  profile?.avatar || (request.senderId as any).avatar,
                standoff2Id: profile?.standoff2Id,
                elo: profile?.elo,
              },
              createdAt: request.createdAt,
            };
          })
        );

        reply.send({ requests: requestsWithProfiles });
      } catch (error) {
        console.error("Get incoming requests error:", error);
        reply.status(500).send({ message: "Failed to fetch friend requests" });
      }
    }
  );

  // Accept friend request
  fastify.post<{ Params: { requestId: string } }>(
    "/accept/:requestId",
    { preHandler: authenticateToken },
    async (req, reply) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const { requestId } = req.params;
        const userId = (req as any).user.id;
        const userName = (req as any).user.name;

        const friendRequest = await FriendRequest.findOne({
          _id: requestId,
          receiverId: userId,
          status: FriendRequestStatus.PENDING,
        }).session(session);

        if (!friendRequest) {
          await session.abortTransaction();
          return reply.status(404).send({ message: "Friend request not found" });
        }

        friendRequest.status = FriendRequestStatus.ACCEPTED;
        await friendRequest.save({ session });

        // Ensure both users have each other in their friends list
        const senderId = friendRequest.senderId;
        const acceptorId = new mongoose.Types.ObjectId(userId);

        await PlayerProfile.findOneAndUpdate(
          { userId: acceptorId },
          { $addToSet: { friends: senderId } },
          { session }
        );

        await PlayerProfile.findOneAndUpdate(
          { userId: senderId },
          { $addToSet: { friends: acceptorId } },
          { session }
        );

        await Notification.create(
          [
            {
              userId: senderId,
              title: "Friend Request Accepted",
              content: `${userName} accepted your friend request`,
              type: "SYSTEM",
              senderId: acceptorId,
            },
          ],
          { session }
        );

        await session.commitTransaction();

        // Notify both users via socket
        const socketManager = (fastify as any).socketManager;
        if (socketManager) {
          socketManager.sendToUser(userId, "friends_list_updated", {});
          socketManager.sendToUser(senderId.toString(), "friends_list_updated", {});
        }

        reply.send({ message: "Friend request accepted" });
      } catch (error) {
        await session.abortTransaction();
        console.error("Accept friend request error:", error);
        reply.status(500).send({ message: "Failed to accept friend request" });
      } finally {
        session.endSession();
      }
    }
  );

  // Get outgoing friend requests
  fastify.get(
    "/requests/outgoing",
    { preHandler: authenticateToken },
    async (req, reply) => {
      try {
        const userId = (req as any).user.id;
        const requests = await FriendRequest.find({
          senderId: userId,
          status: FriendRequestStatus.PENDING,
        })
          .populate("receiverId", "name email avatar")
          .sort({ createdAt: -1 });

        const requestsWithProfiles = await Promise.all(
          requests.map(async (request) => {
            const profile = await PlayerProfile.findOne({
              userId: request.receiverId,
            });
            return {
              id: request._id,
              receiver: {
                id: (request.receiverId as any)._id,
                name: (request.receiverId as any).name,
                avatar:
                  profile?.avatar || (request.receiverId as any).avatar,
                standoff2Id: profile?.standoff2Id,
                elo: profile?.elo,
              },
              createdAt: request.createdAt,
            };
          })
        );

        reply.send({ requests: requestsWithProfiles });
      } catch (error) {
        console.error("Get outgoing requests error:", error);
        reply.status(500).send({ message: "Failed to fetch outgoing friend requests" });
      }
    }
  );

  // Cancel friend request (sender cancels their own request)
  fastify.post<{ Params: { requestId: string } }>(
    "/cancel/:requestId",
    { preHandler: authenticateToken },
    async (req, reply) => {
      try {
        const { requestId } = req.params;
        const userId = (req as any).user.id;

        const friendRequest = await FriendRequest.findOne({
          _id: requestId,
          senderId: userId,
          status: FriendRequestStatus.PENDING,
        });

        if (!friendRequest) {
          return reply.status(404).send({ 
            success: false,
            message: "Friend request not found" 
          });
        }

        friendRequest.status = FriendRequestStatus.REJECTED;
        await friendRequest.save();

        reply.send({ 
          success: true,
          message: "Friend request cancelled" 
        });
      } catch (error) {
        console.error("Cancel friend request error:", error);
        reply.status(500).send({ 
          success: false,
          message: "Failed to cancel friend request" 
        });
      }
    }
  );

  // Reject friend request
  fastify.post<{ Params: { requestId: string } }>(
    "/reject/:requestId",
    { preHandler: authenticateToken },
    async (req, reply) => {
      try {
        const { requestId } = req.params;
        const userId = (req as any).user.id;

        const friendRequest = await FriendRequest.findOne({
          _id: requestId,
          receiverId: userId,
          status: FriendRequestStatus.PENDING,
        });

        if (!friendRequest) {
          return reply.status(404).send({ message: "Friend request not found" });
        }

        friendRequest.status = FriendRequestStatus.REJECTED;
        await friendRequest.save();

        reply.send({ message: "Friend request rejected" });
      } catch (error) {
        console.error("Reject friend request error:", error);
        reply.status(500).send({ message: "Failed to reject friend request" });
      }
    }
  );

  // Get all friends with online status
  fastify.get("/", { preHandler: authenticateToken }, async (req, reply) => {
    try {
      const userId = (req as any).user.id;
      const profile = await PlayerProfile.findOne({ userId });

      if (!profile || !profile.friends || profile.friends.length === 0) {
        return reply.send({ friends: [] });
      }

      const friendProfiles = await PlayerProfile.find({
        userId: { $in: profile.friends },
      }).populate("userId", "name email avatar isOnline lastSeen");

      const friends = friendProfiles
        .filter((fp) => fp.userId) // Ensure userId exists
        .map((fp) => {
          const user = fp.userId as any;
          return {
            id: fp._id,
            userId: user._id,
            name: user.name || "Unknown",
            inGameName: fp.inGameName,
            standoff2Id: fp.standoff2Id,
            avatar: fp.avatar || user.avatar || "/default-avatar.png",
            elo: fp.elo,
            isOnline: user.isOnline || false, // Use online status from User model
            lastSeen: user.lastSeen,
            wins: fp.wins,
            losses: fp.losses,
          };
        });

      reply.send({ friends });
    } catch (error) {
      console.error("Get friends error:", error);
      reply.status(500).send({ message: "Failed to fetch friends" });
    }
  });

  // Remove friend
  fastify.delete<{ Params: { friendId: string } }>(
    "/:friendId",
    { preHandler: authenticateToken },
    async (req, reply) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const { friendId } = req.params;
        const userId = (req as any).user.id;

        // Ensure both users are removed from each other's friends list
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const friendUserObjectId = new mongoose.Types.ObjectId(friendId);

        await PlayerProfile.findOneAndUpdate(
          { userId: userObjectId },
          { $pull: { friends: friendUserObjectId } },
          { session }
        );

        await PlayerProfile.findOneAndUpdate(
          { userId: friendUserObjectId },
          { $pull: { friends: userObjectId } },
          { session }
        );

        await session.commitTransaction();

        // Notify both users via socket
        const socketManager = (fastify as any).socketManager;
        if (socketManager) {
          socketManager.sendToUser(userId, "friends_list_updated", {});
          socketManager.sendToUser(friendId, "friends_list_updated", {});
        }

        reply.send({ message: "Friend removed successfully" });
      } catch (error) {
        await session.abortTransaction();
        console.error("Remove friend error:", error);
        reply.status(500).send({ message: "Failed to remove friend" });
      } finally {
        session.endSession();
      }
    }
  );
};

export default friendRoutes;
