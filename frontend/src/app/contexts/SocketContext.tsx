"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
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
    if (!token) return;

    // Create socket connection
    const socket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5001",
      {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        autoConnect: true,
      }
    );

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("🔌 Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
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

    // Notification events
    socket.on("notification", (data) => {
      console.log("🔔 Notification received:", data);
      window.dispatchEvent(new CustomEvent("notification", { detail: data }));
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
