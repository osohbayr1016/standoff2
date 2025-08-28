"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (receiverId: string, content: string) => void;
  sendTypingStart: (receiverId: string) => void;
  sendTypingStop: (receiverId: string) => void;
  markMessageAsRead: (senderId: string) => void;
  updateStatus: (status: "online" | "away" | "busy") => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("🔌 No token available for socket connection");
      return;
    }

    // Create socket connection with better error handling
    const socket = io(
      API_ENDPOINTS.HEALTH.replace('/health', ''),
      {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      }
    );

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("🔌 Socket connected successfully");
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);

      // Attempt to reconnect if it wasn't a manual disconnect
      if (reason === "io server disconnect") {
        console.log("🔌 Server disconnected, attempting to reconnect...");
        socket.connect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
      setIsConnected(false);

      // Handle specific error types
      if (error.message === "Authentication error") {
        console.error("🔌 Authentication failed, clearing token");
        localStorage.removeItem("token");
        // You might want to redirect to login here
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔌 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    socket.on("reconnect_error", (error) => {
      console.error("🔌 Socket reconnection error:", error);
      setIsConnected(false);
    });

    socket.on("reconnect_failed", () => {
      console.error("🔌 Socket reconnection failed after all attempts");
      setIsConnected(false);
    });

    // Message events
    socket.on("new_message", (data) => {
      console.log("📨 New message received:", data);
      // You can emit a custom event here to notify components
      window.dispatchEvent(new CustomEvent("new_message", { detail: data }));
    });

    socket.on("message_delivered", (data) => {
      console.log("✅ Message delivered:", data);
      window.dispatchEvent(
        new CustomEvent("message_delivered", { detail: data })
      );
    });

    socket.on("message_sent_offline", (data) => {
      console.log("📤 Message sent offline:", data);
      window.dispatchEvent(
        new CustomEvent("message_sent_offline", { detail: data })
      );
    });

    socket.on("message_error", (data) => {
      console.error("❌ Message error:", data);
      window.dispatchEvent(new CustomEvent("message_error", { detail: data }));
    });

    // Typing events
    socket.on("user_typing", (data) => {
      console.log("⌨️ User typing:", data);
      window.dispatchEvent(new CustomEvent("user_typing", { detail: data }));
    });

    socket.on("user_stopped_typing", (data) => {
      console.log("⌨️ User stopped typing:", data);
      window.dispatchEvent(
        new CustomEvent("user_stopped_typing", { detail: data })
      );
    });

    // Read receipt events
    socket.on("message_read", (data) => {
      console.log("👁️ Message read:", data);
      window.dispatchEvent(new CustomEvent("message_read", { detail: data }));
    });

    // Status events
    socket.on("user_status_changed", (data) => {
      console.log("🔄 User status changed:", data);
      window.dispatchEvent(
        new CustomEvent("user_status_changed", { detail: data })
      );
    });

    socket.on("user_offline", (data) => {
      console.log("🔴 User offline:", data);
      window.dispatchEvent(new CustomEvent("user_offline", { detail: data }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("send_message", { receiverId, content });
    }
  };

  const sendTypingStart = (receiverId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing_start", { receiverId });
    }
  };

  const sendTypingStop = (receiverId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing_stop", { receiverId });
    }
  };

  const markMessageAsRead = (senderId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("mark_read", { senderId });
    }
  };

  const updateStatus = (status: "online" | "away" | "busy") => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("update_status", { status });
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markMessageAsRead,
    updateStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
