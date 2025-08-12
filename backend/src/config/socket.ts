import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth";

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

      // Handle private message
      socket.on(
        "send_message",
        async (data: { receiverId: string; content: string }) => {
          try {
            console.log(
              `📨 Message from ${userName} to ${data.receiverId}: ${data.content}`
            );

            // Emit to receiver if online
            const receiverSocketId = this.userSockets.get(data.receiverId);
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit("new_message", {
                senderId: userId,
                senderName: userName,
                content: data.content,
                timestamp: new Date().toISOString(),
              });

              // Send delivery confirmation to sender
              socket.emit("message_delivered", {
                receiverId: data.receiverId,
                timestamp: new Date().toISOString(),
              });
            } else {
              // Receiver is offline, send offline notification
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
      socket.on("mark_read", (data: { senderId: string }) => {
        const senderSocketId = this.userSockets.get(data.senderId);
        if (senderSocketId) {
          this.io.to(senderSocketId).emit("message_read", {
            readerId: userId,
            readerName: userName,
            timestamp: new Date().toISOString(),
          });
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
}

export default SocketManager;
