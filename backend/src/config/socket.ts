import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth";
import { NotificationService } from "../utils/notificationService";
import Message from "../models/Message";
import User from "../models/User";

interface AuthenticatedSocket {
  userId: string;
  userRole: string;
  userName: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JWTPayload;
        const authenticatedSocket = socket as any;
        authenticatedSocket.userId = decoded.id;
        authenticatedSocket.userRole = decoded.role;
        authenticatedSocket.userName = decoded.email;

        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: any) => {
      const { userId, userRole, userName } = socket as AuthenticatedSocket;

      console.log(`🔌 User connected: ${userName} (${userId})`);

      // Store user's socket connection
      this.userSockets.set(userId, socket.id);

      // Join user to their personal room
      socket.join(`user:${userId}`);

      // Send pending notifications to user
      this.sendPendingNotifications(userId, socket);

      // Handle private message
      socket.on(
        "send_message",
        async (data: { receiverId: string; content: string }) => {
          try {
            console.log(
              `📨 Message from ${userName} to ${data.receiverId}: ${data.content}`
            );

            // Get sender details
            const sender = await User.findById(userId).select("name avatar");
            if (!sender) {
              throw new Error("Sender not found");
            }

            // Create message in database
            const message = await Message.create({
              senderId: userId,
              receiverId: data.receiverId,
              content: data.content,
              status: "SENT",
            });

            // Populate message with sender and receiver details
            await message.populate([
              { path: "senderId", select: "id name avatar" },
              { path: "receiverId", select: "id name avatar" },
            ]);

            // Emit to receiver if online
            const receiverSocketId = this.userSockets.get(data.receiverId);
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit("new_message", {
                id: message._id.toString(),
                senderId: userId,
                senderName: sender.name,
                senderAvatar: sender.avatar,
                content: data.content,
                receiverId: data.receiverId,
                timestamp: message.createdAt.toISOString(),
              });

              // Send delivery confirmation to sender
              socket.emit("message_delivered", {
                receiverId: data.receiverId,
                timestamp: new Date().toISOString(),
              });
            } else {
              // Receiver is offline, create notification
              await NotificationService.createMessageNotification(
                userId,
                data.receiverId,
                message._id.toString(),
                data.content
              );

              // Send offline notification to sender
              socket.emit("message_sent_offline", {
                receiverId: data.receiverId,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error("Error handling send_message:", error);
            socket.emit("message_error", {
              error: "Failed to send message",
              timestamp: new Date().toISOString(),
            });
          }
        }
      );

      // Handle typing indicators
      socket.on("typing_start", (data: { receiverId: string }) => {
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_typing", {
            userId: userId,
            userName: userName,
          });
        }
      });

      socket.on("typing_stop", (data: { receiverId: string }) => {
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_stopped_typing", {
            userId: userId,
            userName: userName,
          });
        }
      });

      // Handle read receipts
      socket.on("mark_read", async (data: { senderId: string }) => {
        try {
          const senderSocketId = this.userSockets.get(data.senderId);
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("message_read", {
              readerId: userId,
              readerName: userName,
              timestamp: new Date().toISOString(),
            });
          }

          // Mark notifications as seen
          await NotificationService.markNotificationsAsSeen(
            userId,
            data.senderId
          );
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      // Handle user status updates
      socket.on(
        "update_status",
        (data: { status: "online" | "away" | "busy" }) => {
          socket.broadcast.emit("user_status_changed", {
            userId: userId,
            userName: userName,
            status: data.status,
            timestamp: new Date().toISOString(),
          });
        }
      );

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`🔌 User disconnected: ${userName} (${userId})`);
        this.userSockets.delete(userId);

        // Notify others that user is offline
        socket.broadcast.emit("user_offline", {
          userId: userId,
          userName: userName,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  // Method to broadcast to all connected users
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Method to get connected users count
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Method to check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Method to get all online users
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Method to send pending notifications to user
  private async sendPendingNotifications(userId: string, socket: any) {
    try {
      const pendingNotifications =
        await NotificationService.getPendingNotifications(userId, 10);

      if (pendingNotifications.length > 0) {
        socket.emit("pending_notifications", {
          notifications: pendingNotifications,
          count: pendingNotifications.length,
        });

        console.log(
          `📬 Sent ${pendingNotifications.length} pending notifications to user ${userId}`
        );
      }
    } catch (error) {
      console.error("Error sending pending notifications:", error);
    }
  }
}

export default SocketManager;
