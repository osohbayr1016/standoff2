import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth";
import Message from "../models/Message";
import User from "../models/User";
import Notification from "../models/Notification";
import StreamSession from "../models/StreamSession";
import StreamChat from "../models/StreamChat";
import StreamViewer from "../models/StreamViewer";
import { StreamService } from "../services/streamService";
import { QueueService } from "../services/queueService";

export class SocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  public initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: true, // Allow all origins
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          // Allow connection without authentication for connection status
          socket.data.userId = null;
          socket.data.userEmail = null;
          return next();
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JWTPayload;
        socket.data.userId = decoded.id;
        socket.data.userEmail = decoded.email;
        next();
      } catch (error) {
        // Allow connection even if token is invalid for connection status
        socket.data.userId = null;
        socket.data.userEmail = null;
        next();
      }
    });

    this.io.on("connection", async (socket) => {
      // Only handle authenticated users
      if (socket.data.userId) {
        this.connectedUsers.set(socket.data.userId, socket.id);

        // Update user online status in database
        await User.findByIdAndUpdate(socket.data.userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Update user online status
        this.broadcastUserStatus(socket.data.userId, "online");
      }

      // Send pending notifications when user comes online (only for authenticated users)
      if (socket.data.userId) {
        try {
          const pendingNotifications = await Notification.find({
            userId: socket.data.userId,
            status: "PENDING",
          })
            .populate("senderId", "name avatar")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

          if (pendingNotifications.length > 0) {
            const formattedNotifications = pendingNotifications.map(
              (notif: any) => ({
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
              })
            );

            socket.emit("pending_notifications", {
              notifications: formattedNotifications,
              count: formattedNotifications.length,
            });
          }
        } catch (error) {
          console.error("Error fetching pending notifications:", error);
        }
      }

      // Handle message sending
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

          // Get sender info
          const sender = await User.findById(senderId).select("name avatar");
          if (!sender) {
            socket.emit("message_error", {
              error: "Sender not found",
            });
            return;
          }

          // Get receiver info
          const receiver = await User.findById(receiverId).select(
            "name avatar"
          );
          if (!receiver) {
            socket.emit("message_error", {
              error: "Receiver not found",
            });
            return;
          }

          // Save message to database
          const newMessage = new Message({
            senderId,
            receiverId,
            content: content.trim(),
            status: "SENT",
            isRead: false,
            ...(replyToId && { replyToId }),
          });

          await newMessage.save();

          // Populate replyTo if exists
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

          // Create notification for the receiver
          const notification = new Notification({
            userId: receiverId,
            senderId: senderId,
            title: `New message from ${sender.name}`,
            content: content.trim().substring(0, 100),
            type: "MESSAGE",
            status: "PENDING",
            relatedMessageId: newMessage._id,
          });

          await notification.save();

          // Prepare message data for real-time delivery
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
            replyToId: (newMessage as any).replyToId?._id?.toString(),
            replyTo: (newMessage as any).replyToId
              ? {
                  id: (newMessage as any).replyToId._id.toString(),
                  content: (newMessage as any).replyToId.content,
                  sender: {
                    name:
                      (newMessage as any).replyToId.senderId?.name || "Unknown",
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

          // Check if receiver is online
          const receiverSocketId = this.connectedUsers.get(receiverId);
          if (receiverSocketId) {
            // Send message to online user
            this.io!.to(receiverSocketId).emit("new_message", messageData);

            // Send notification to online user
            this.io!.to(receiverSocketId).emit("new_notification", {
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

            // Update message status to DELIVERED
            await Message.findByIdAndUpdate(newMessage._id, {
              status: "DELIVERED",
            });

            // Send delivery confirmation to sender
            socket.emit("message_delivered", {
              messageId: newMessage._id.toString(),
              receiverId,
              timestamp: new Date().toISOString(),
            });
          } else {
            // User is offline - message saved but not delivered
            socket.emit("message_sent_offline", {
              messageId: newMessage._id.toString(),
              receiverId,
              timestamp: new Date().toISOString(),
            });
          }

          // Also emit to sender for confirmation
          socket.emit("message_sent", messageData);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("message_error", {
            error: "Failed to send message",
          });
        }
      });

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        const { receiverId } = data;
        const receiverSocketId = this.connectedUsers.get(receiverId);
        if (receiverSocketId) {
          this.io!.to(receiverSocketId).emit("user_typing", {
            userId: socket.data.userId,
          });
        }
      });

      socket.on("typing_stop", (data) => {
        const { receiverId } = data;
        const receiverSocketId = this.connectedUsers.get(receiverId);
        if (receiverSocketId) {
          this.io!.to(receiverSocketId).emit("user_stopped_typing", {
            userId: socket.data.userId,
          });
        }
      });

      // Handle read receipts
      socket.on("mark_read", async (data) => {
        try {
          const { senderId } = data;
          const receiverId = socket.data.userId;

          // Update messages as read in database
          await Message.updateMany(
            {
              senderId,
              receiverId,
              isRead: false,
            },
            {
              isRead: true,
              status: "READ",
              readAt: new Date(),
            }
          );

          // Notify sender that messages were read
          const senderSocketId = this.connectedUsers.get(senderId);
          if (senderSocketId) {
            this.io!.to(senderSocketId).emit("message_read", {
              readerId: receiverId,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      // Handle stream chat messages
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

          // Send message using StreamService
          const chatMessage = await StreamService.sendChatMessage(
            streamId,
            senderId,
            message.trim(),
            replyToId
          );

          // Populate the message with user data
          const populatedMessage = await StreamChat.findById(chatMessage._id)
            .populate("userId", "name avatar")
            .populate("replyToId", "message userId");

          // Broadcast to all viewers of the stream
          this.io!.to(`stream_${streamId}`).emit("stream_chat_message", {
            streamId,
            message: populatedMessage,
          });

          // Send confirmation to sender
          socket.emit("stream_chat_sent", {
            messageId: chatMessage._id,
            streamId,
          });
        } catch (error: any) {
          console.error("Error sending stream chat message:", error);
          socket.emit("stream_chat_error", {
            error: error.message || "Failed to send message",
          });
        }
      });

      // Handle joining a stream
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

          // Add viewer to stream
          const sessionId = `socket_${socket.id}`;
          const viewer = await StreamService.addViewer(
            streamId,
            userId,
            sessionId
          );

          // Join socket room for the stream
          socket.join(`stream_${streamId}`);

          // Send confirmation
          socket.emit("stream_joined", {
            streamId,
            viewerId: viewer._id,
          });

          // Broadcast viewer count update
          this.io!.to(`stream_${streamId}`).emit("stream_viewer_count", {
            streamId,
            viewerCount: await StreamViewer.countDocuments({
              streamSessionId: streamId,
              isActive: true,
            }),
          });
        } catch (error: any) {
          console.error("Error joining stream:", error);
          socket.emit("stream_error", {
            error: error.message || "Failed to join stream",
          });
        }
      });

      // Handle leaving a stream
      socket.on("leave_stream", async (data) => {
        try {
          const { streamId } = data;
          const userId = socket.data.userId;

          if (!streamId) {
            return;
          }

          // Remove viewer from stream
          const sessionId = `socket_${socket.id}`;
          await StreamService.removeViewer(streamId, userId, sessionId);

          // Leave socket room
          socket.leave(`stream_${streamId}`);

          // Broadcast viewer count update
          this.io!.to(`stream_${streamId}`).emit("stream_viewer_count", {
            streamId,
            viewerCount: await StreamViewer.countDocuments({
              streamSessionId: streamId,
              isActive: true,
            }),
          });
        } catch (error: any) {
          console.error("Error leaving stream:", error);
        }
      });

      // Handle stream reactions
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

          // Broadcast reaction to all stream viewers
          this.io!.to(`stream_${streamId}`).emit("stream_reaction", {
            streamId,
            emoji,
            userId,
            timestamp: new Date().toISOString(),
          });
        } catch (error: any) {
          console.error("Error handling stream reaction:", error);
          socket.emit("stream_error", {
            error: "Failed to send reaction",
          });
        }
      });

      // Handle status updates
      socket.on("update_status", (data) => {
        const { status } = data;
        this.broadcastUserStatus(socket.data.userId, status);
      });

      // Friend-related socket events
      socket.on("friend_request_sent", async (data) => {
        try {
          const { receiverId, senderData } = data;
          const receiverSocketId = this.connectedUsers.get(receiverId);
          
          if (receiverSocketId) {
            this.io!.to(receiverSocketId).emit("friend_request_received", {
              sender: senderData,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error handling friend request sent:", error);
        }
      });

      socket.on("friend_request_accepted", async (data) => {
        try {
          const { senderId, acceptorData } = data;
          const senderSocketId = this.connectedUsers.get(senderId);
          
          if (senderSocketId) {
            this.io!.to(senderSocketId).emit("friend_request_accepted_notification", {
              acceptor: acceptorData,
              timestamp: new Date().toISOString(),
            });
          }

          // Notify both users to refresh their friends list
          socket.emit("friends_list_updated");
          if (senderSocketId) {
            this.io!.to(senderSocketId).emit("friends_list_updated");
          }
        } catch (error) {
          console.error("Error handling friend request accepted:", error);
        }
      });

      // Lobby invite events for matchmaking
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
            const sender = await User.findById(senderId).select("name avatar");
            
            this.io!.to(friendSocketId).emit("lobby_invite_received", {
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
          } else {
            socket.emit("lobby_invite_error", {
              error: "Friend is offline",
            });
          }
        } catch (error) {
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
            const responder = await User.findById(responderId).select("name avatar");
            
            this.io!.to(senderSocketId).emit("lobby_invite_responded", {
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
        } catch (error) {
          console.error("Error handling lobby invite response:", error);
        }
      });

      // ===== MATCHMAKING QUEUE EVENTS =====

      // Join matchmaking room to receive queue updates
      socket.on("join_matchmaking_room", async () => {
        try {
          socket.join("matchmaking_queue");
          console.log(`👀 User ${socket.data.userId} joined matchmaking room for updates`);
          
          // Send current queue count
          const totalInQueue = await QueueService.getTotalInQueue();
          socket.emit("queue_update", {
            totalPlayers: totalInQueue,
          });
        } catch (error: any) {
          console.error("Join matchmaking room error:", error);
        }
      });

      // Join matchmaking queue
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
          const result = await QueueService.addToQueue(userId, partyMembers);

          // Join queue room for broadcasts
          socket.join("matchmaking_queue");

          socket.emit("queue_joined", {
            success: true,
            position: result.position,
          });

          // Broadcast updated queue count to all in queue
          const totalInQueue = await QueueService.getTotalInQueue();
          this.io!.to("matchmaking_queue").emit("queue_update", {
            totalPlayers: totalInQueue,
          });
        } catch (error: any) {
          console.error("Join queue error:", error);
          socket.emit("queue_error", {
            error: error.message || "Failed to join queue",
          });
        }
      });

      // Leave matchmaking queue
      socket.on("leave_queue", async () => {
        try {
          const userId = socket.data.userId;
          if (!userId) return;

          await QueueService.removeFromQueue(userId);
          socket.leave("matchmaking_queue");

          socket.emit("queue_left", {
            success: true,
          });

          // Broadcast updated queue count
          const totalInQueue = await QueueService.getTotalInQueue();
          this.io!.to("matchmaking_queue").emit("queue_update", {
            totalPlayers: totalInQueue,
          });
        } catch (error: any) {
          console.error("Leave queue error:", error);
          socket.emit("queue_error", {
            error: error.message || "Failed to leave queue",
          });
        }
      });

      // Get queue status
      socket.on("get_queue_status", async () => {
        try {
          const userId = socket.data.userId;
          if (!userId) {
            socket.emit("queue_status", {
              inQueue: false,
              totalPlayers: await QueueService.getTotalInQueue(),
            });
            return;
          }

          const position = await QueueService.getQueuePosition(userId);
          const totalInQueue = await QueueService.getTotalInQueue();

          socket.emit("queue_status", {
            inQueue: position > 0,
            position,
            totalPlayers: totalInQueue,
          });
        } catch (error: any) {
          console.error("Get queue status error:", error);
        }
      });

      // ===== LOBBY EVENTS =====

      // Join lobby room
      socket.on("join_lobby", async (data) => {
        try {
          const { lobbyId } = data;
          if (!lobbyId) return;

          socket.join(`lobby_${lobbyId}`);
          
          // Send current lobby state
          const lobby = await QueueService.getLobby(lobbyId);
          socket.emit("lobby_state", { lobby });
        } catch (error: any) {
          console.error("Join lobby error:", error);
          socket.emit("lobby_error", {
            error: error.message || "Failed to join lobby",
          });
        }
      });

      // Player clicks ready
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

          const result = await QueueService.markPlayerReady(lobbyId, userId);

          // Broadcast updated lobby state to all players in lobby
          this.io!.to(`lobby_${lobbyId}`).emit("lobby_update", {
            lobby: result.lobby,
            allReady: result.allReady,
          });

          if (result.allReady) {
            // All players ready - emit special event
            this.io!.to(`lobby_${lobbyId}`).emit("all_players_ready", {
              lobby: result.lobby,
            });
          }
        } catch (error: any) {
          console.error("Player ready error:", error);
          socket.emit("lobby_error", {
            error: error.message || "Failed to mark ready",
          });
        }
      });

      // Leave lobby (cancels for everyone)
      socket.on("leave_lobby", async (data) => {
        try {
          const { lobbyId } = data;
          const userId = socket.data.userId;

          if (!userId || !lobbyId) return;

          const cancelled = await QueueService.cancelLobby(lobbyId);

          if (cancelled) {
            // Notify all players that lobby was cancelled
            this.io!.to(`lobby_${lobbyId}`).emit("lobby_cancelled", {
              reason: "A player left the lobby",
            });

            // Remove all players from lobby room
            const socketsInRoom = await this.io!.in(`lobby_${lobbyId}`).fetchSockets();
            socketsInRoom.forEach((s) => {
              s.leave(`lobby_${lobbyId}`);
            });
          }

          socket.emit("lobby_left", {
            success: true,
          });
        } catch (error: any) {
          console.error("Leave lobby error:", error);
          socket.emit("lobby_error", {
            error: error.message || "Failed to leave lobby",
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", async () => {
        const userId = socket.data.userId;
        
        if (userId) {
          this.connectedUsers.delete(userId);

          // Remove from queue if in queue
          await QueueService.removeFromQueue(userId);

          // Update user offline status in database
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          this.broadcastUserStatus(userId, "offline");
        }
      });
    });
  }

  private async broadcastUserStatus(userId: string, status: string): Promise<void> {
    if (this.io) {
      this.io.emit("user_status_changed", {
        userId,
        status,
        timestamp: new Date().toISOString(),
      });

      // Also notify friends specifically
      try {
        const PlayerProfile = (await import("../models/PlayerProfile")).default;
        const profile = await PlayerProfile.findOne({ userId });
        
        if (profile && profile.friends && profile.friends.length > 0) {
          profile.friends.forEach((friendId) => {
            const friendSocketId = this.connectedUsers.get(friendId.toString());
            if (friendSocketId) {
              this.io!.to(friendSocketId).emit("friend_status_changed", {
                friendId: userId,
                status,
                timestamp: new Date().toISOString(),
              });
            }
          });
        }
      } catch (error) {
        console.error("Error notifying friends of status change:", error);
      }
    }
  }

  public broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public sendToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Stream-specific methods
  public broadcastStreamEvent(
    streamId: string,
    event: string,
    data: any
  ): void {
    if (this.io) {
      this.io.to(`stream_${streamId}`).emit(event, data);
    }
  }

  public broadcastStreamStarted(streamSession: any): void {
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

  public broadcastStreamEnded(streamSession: any): void {
    if (this.io) {
      this.io.emit("stream_ended", {
        streamId: streamSession._id,
        title: streamSession.title,
        duration: streamSession.duration,
        timestamp: new Date().toISOString(),
      });
    }
  }

  public updateStreamViewerCount(streamId: string, count: number): void {
    if (this.io) {
      this.io.to(`stream_${streamId}`).emit("stream_viewer_count", {
        streamId,
        viewerCount: count,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Matchmaking-specific methods
  public notifyLobbyFound(userIds: string[], lobbyData: any): void {
    if (this.io) {
      userIds.forEach((userId) => {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
          this.io!.to(socketId).emit("lobby_found", lobbyData);
        }
      });
    }
  }

  public broadcastQueueUpdate(totalPlayers: number): void {
    if (this.io) {
      this.io.to("matchmaking_queue").emit("queue_update", {
        totalPlayers,
      });
    }
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default SocketManager;
