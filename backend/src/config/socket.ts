import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth";
import Message from "../models/Message";
import User from "../models/User";
import Notification from "../models/Notification";

export class SocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  public initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
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

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JWTPayload;
        socket.data.userId = decoded.id;
        socket.data.userEmail = decoded.email;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", async (socket) => {
      this.connectedUsers.set(socket.data.userId, socket.id);

      // Update user online status in database
      await User.findByIdAndUpdate(socket.data.userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Update user online status
      this.broadcastUserStatus(socket.data.userId, "online");

      // Send pending notifications when user comes online
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

      // Handle status updates
      socket.on("update_status", (data) => {
        const { status } = data;
        this.broadcastUserStatus(socket.data.userId, status);
      });

      // Handle disconnection
      socket.on("disconnect", async () => {
        this.connectedUsers.delete(socket.data.userId);

        // Update user offline status in database
        await User.findByIdAndUpdate(socket.data.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        this.broadcastUserStatus(socket.data.userId, "offline");
      });
    });
  }

  private broadcastUserStatus(userId: string, status: string): void {
    if (this.io) {
      this.io.emit("user_status_changed", {
        userId,
        status,
        timestamp: new Date().toISOString(),
      });
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
}

export default SocketManager;
