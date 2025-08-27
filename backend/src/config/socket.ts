import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth";

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        socket.data.userId = decoded.id;
        socket.data.userEmail = decoded.email;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`🔌 User connected: ${socket.data.userId}`);
      this.connectedUsers.set(socket.data.userId, socket.id);

      // Update user online status
      this.broadcastUserStatus(socket.data.userId, "online");

      // Handle message sending
      socket.on("send_message", async (data) => {
        try {
          const { receiverId, content } = data;
          console.log(`📨 Message from ${socket.data.userId} to ${receiverId}: ${content}`);

          // Check if receiver is online
          const receiverSocketId = this.connectedUsers.get(receiverId);
          if (receiverSocketId) {
            // Send to online user
            this.io!.to(receiverSocketId).emit("new_message", {
              senderId: socket.data.userId,
              content,
              timestamp: new Date().toISOString(),
            });
            
            // Send delivery confirmation to sender
            socket.emit("message_delivered", {
              receiverId,
              timestamp: new Date().toISOString(),
            });
          } else {
            // User is offline - message will be stored in database
            socket.emit("message_sent_offline", {
              receiverId,
              timestamp: new Date().toISOString(),
            });
          }
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
      socket.on("mark_read", (data) => {
        const { senderId } = data;
        const senderSocketId = this.connectedUsers.get(senderId);
        if (senderSocketId) {
          this.io!.to(senderSocketId).emit("message_read", {
            readerId: socket.data.userId,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Handle status updates
      socket.on("update_status", (data) => {
        const { status } = data;
        this.broadcastUserStatus(socket.data.userId, status);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`🔌 User disconnected: ${socket.data.userId}`);
        this.connectedUsers.delete(socket.data.userId);
        this.broadcastUserStatus(socket.data.userId, "offline");
      });
    });

    console.log("✅ WebSocket server initialized");
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
